package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"firebase.google.com/go/v4/auth"
	"github.com/gorilla/websocket"
	"pag-backend/internal/config"
	"pag-backend/internal/repository"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Configured via reverse proxy / CORS
	},
}

type WSEvent struct {
	Type      string `json:"type"`
	Room      string `json:"room,omitempty"`
	Payload   any    `json:"payload"`
	Timestamp int64  `json:"timestamp"`
}

type Client struct {
	hub    *Hub
	conn   *websocket.Conn
	send   chan []byte
	userID string
	rooms  map[string]bool
	mu     sync.Mutex
}

type Hub struct {
	clients    map[*Client]bool
	rooms      map[string]map[*Client]bool
	register   chan *Client
	unregister chan *Client
	broadcast  chan RoomMessage
	mu         sync.RWMutex
	authClient *auth.Client
	userRepo   *repository.UserRepository
	cfg        *config.Config
}

type RoomMessage struct {
	Room    string
	Payload []byte
}

func NewHub(cfg *config.Config, authClient *auth.Client, userRepo *repository.UserRepository) *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		rooms:      make(map[string]map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan RoomMessage, 256),
		authClient: authClient,
		userRepo:   userRepo,
		cfg:        cfg,
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			if client.userID != "" {
				userRoom := "user:" + client.userID
				h.joinRoom(client, userRoom)
			}
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				for room := range client.rooms {
					if clientsInRoom, exists := h.rooms[room]; exists {
						delete(clientsInRoom, client)
						if len(clientsInRoom) == 0 {
							delete(h.rooms, room)
						}
					}
				}
				close(client.send)
			}
			h.mu.Unlock()

		case msg := <-h.broadcast:
			h.mu.RLock()
			if clients, ok := h.rooms[msg.Room]; ok {
				for client := range clients {
					select {
					case client.send <- msg.Payload:
					default:
						close(client.send)
						delete(h.clients, client)
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) joinRoom(client *Client, room string) {
	client.mu.Lock()
	client.rooms[room] = true
	client.mu.Unlock()

	if _, ok := h.rooms[room]; !ok {
		h.rooms[room] = make(map[*Client]bool)
	}
	h.rooms[room][client] = true
}

func (h *Hub) BroadcastToRoom(room string, eventType string, payload any) {
	event := WSEvent{
		Type:      eventType,
		Room:      room,
		Payload:   payload,
		Timestamp: time.Now().UnixMilli(),
	}
	bytes, err := json.Marshal(event)
	if err != nil {
		return
	}
	h.broadcast <- RoomMessage{
		Room:    room,
		Payload: bytes,
	}
}

func (h *Hub) BroadcastToUser(userID, eventType string, payload any) {
	h.BroadcastToRoom("user:"+userID, eventType, payload)
}

func (h *Hub) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	tokenString := r.URL.Query().Get("token")
	var userID string

	if tokenString != "" && h.authClient != nil {
		token, err := h.authClient.VerifyIDToken(r.Context(), tokenString)
		if err == nil && token != nil {
			user, _ := h.userRepo.FindByFirebaseUID(r.Context(), token.UID)
			if user != nil {
				userID = user.ID
			}
		}
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[WS ERROR] Upgrade failed: %v", err)
		return
	}

	client := &Client{
		hub:    h,
		conn:   conn,
		send:   make(chan []byte, 256),
		userID: userID,
		rooms:  make(map[string]bool),
	}

	h.register <- client

	go client.writePump(h.cfg)
	go client.readPump(h.cfg)
}

func (c *Client) readPump(cfg *config.Config) {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(cfg.WSMaxMessageSize)
	pongWait := time.Duration(cfg.WSPongTimeoutSeconds) * time.Second
	_ = c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		_ = c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			break
		}

		// Handle client subscription commands: {"action": "subscribe", "room": "survey:123"}
		var cmd struct {
			Action string `json:"action"`
			Room   string `json:"room"`
		}
		if err := json.Unmarshal(message, &cmd); err == nil && cmd.Room != "" {
			c.hub.mu.Lock()
			if cmd.Action == "subscribe" {
				c.hub.joinRoom(c, cmd.Room)
			} else if cmd.Action == "unsubscribe" {
				c.mu.Lock()
				delete(c.rooms, cmd.Room)
				c.mu.Unlock()
				if clients, ok := c.hub.rooms[cmd.Room]; ok {
					delete(clients, c)
				}
			}
			c.hub.mu.Unlock()
		}
	}
}

func (c *Client) writePump(cfg *config.Config) {
	ticker := time.NewTicker(time.Duration(cfg.WSPingIntervalSeconds) * time.Second)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			_ = c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				_ = c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			_, _ = w.Write(message)
			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			_ = c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

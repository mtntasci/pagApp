package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"pag-backend/internal/model"
)

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeSuccess(w http.ResponseWriter, data any, message string) {
	writeJSON(w, http.StatusOK, model.APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func writeSuccessWithMeta(w http.ResponseWriter, data any, message string, meta any) {
	writeJSON(w, http.StatusOK, model.APIResponse{
		Success: true,
		Message: message,
		Data:    data,
		Meta:    meta,
	})
}

func writeError(w http.ResponseWriter, message string, status int) {
	writeJSON(w, status, model.APIResponse{
		Success: false,
		Error:   message,
	})
}

func randString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyz0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[time.Now().UnixNano()%int64(len(letters))]
	}
	return string(b)
}


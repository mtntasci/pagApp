# Stage 1: Build
FROM golang:alpine AS builder

WORKDIR /app

RUN apk add --no-cache git ca-certificates tzdata

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/pag-server ./cmd/server/main.go
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/pag-migrate ./cmd/migrate/main.go

# Stage 2: Minimal Runtime
FROM alpine:3.19

WORKDIR /app

RUN apk --no-cache add ca-certificates tzdata

COPY --from=builder /app/pag-server /app/pag-server
COPY --from=builder /app/pag-migrate /app/pag-migrate
COPY --from=builder /app/migrations /app/migrations

# Expose port 3000
EXPOSE 3000

CMD ["/app/pag-server"]

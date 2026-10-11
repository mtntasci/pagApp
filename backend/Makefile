.PHONY: all build run test migrate-up migrate-down migrate-status docker-build docker-run

all: build

build:
	go build -o bin/pag-server ./cmd/server/main.go
	go build -o bin/pag-migrate ./cmd/migrate/main.go

run:
	go run ./cmd/server/main.go

migrate-up:
	go run ./cmd/migrate/main.go up

migrate-down:
	go run ./cmd/migrate/main.go down

migrate-status:
	go run ./cmd/migrate/main.go status

test:
	go test -v ./...

docker-build:
	docker build -t pag-api:latest .

docker-run:
	docker run -d --name pag-api --network host --env-file .env -v $(PWD)/serviceAccountKey.json:/app/serviceAccountKey.json:ro pag-api:latest

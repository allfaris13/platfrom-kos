.PHONY: run build docker-up docker-down

run:
	go run cmd/api/main.go

build:
	go build -o bin/main cmd/api/main.go

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down

lint:
	golangci-lint run


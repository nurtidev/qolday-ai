.PHONY: up down build logs backend-dev frontend-dev migrate

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

restart:
	docker compose restart

backend-dev:
	cd backend && go run ./cmd/server

frontend-dev:
	cd frontend && npm run dev

migrate:
	cd backend && go run ./cmd/migrate

tidy:
	cd backend && go mod tidy

install-frontend:
	cd frontend && npm install

# Run postgres + redis only (for local dev without docker backend/frontend)
infra:
	docker compose up -d postgres redis

status:
	docker compose ps

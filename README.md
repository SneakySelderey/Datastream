# Datastream Docker Setup

This project runs with two containers:

- `server` (NestJS API + scanner + WebSocket)
- `client` (built Vite frontend served by Nginx, with reverse proxy to backend for `/api` and `/stream`)

## Run

```bash
docker compose up --build
```

Open:

- `http://localhost:8080` (frontend)
- `http://localhost:3000` (backend, optional direct access)

## Routing

- Browser calls `client` on port `8080`.
- `client` Nginx proxies:
  - `/api/*` -> backend (`server:3000`) with `/api` prefix stripped
  - `/stream/*` -> backend (`server:3000`)
- other paths are served as SPA routes by frontend.

WebSocket path used by frontend:

- `/api/socket.io` -> backend Socket.IO endpoint `/socket.io` (via Nginx proxy)

## Notes

- SQLite DB is persisted in the named volume `datastream_db`.
- If you need HTTPS/HTTP/3, place an external reverse proxy in front later (Nginx/Caddy/Traefik/CDN).

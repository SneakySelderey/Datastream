# Overview

![Albums screenshot](docs/images/albums-page.png)

Main features:

- Automatic music library scanning from a mounted host folder
- Browse and filter tracks, albums, and artists
- Playlist management (create, update, and organize tracks)
- JWT-based authentication with cookie support
- HTTP audio streaming endpoints
- Realtime scanner updates over WebSocket
- Persistent SQLite database storage via Docker volume
- One-command deployment with Docker Compose

![Album screenshot](docs/images/album-page.png)

This project runs with two containers:

- `server` (NestJS API + scanner + WebSocket)
- `client` (built Vite frontend served by Nginx, with reverse proxy to backend for `/api` and `/stream`)

## Installation

Create root `.env`:

```bash
JWT_SECRET=SUPER_SECRET_KEY
CLIENT_PORT=8080
MUSIC_HOST_PATH=./apps/server/temp-music-dir
COOKIE_SECURE=false
```

Use this `docker-compose.yml`:

```yaml
services:
  server:
    image:
      sneakyselderey/datastream-server:latest
    environment:
      JWT_SECRET: ${JWT_SECRET:-SUPER_SECRET_KEY}
      COOKIE_SECURE: ${COOKIE_SECURE:-false}
    volumes:
      - datastream_db:/data
      - ${MUSIC_HOST_PATH:-./apps/server/temp-music-dir}:/music:ro
    restart: unless-stopped
    networks:
      - datastream

  client:
    image:
      sneakyselderey/datastream-client:latest
    depends_on:
      - server
    ports:
      - "${CLIENT_PORT:-8080}:80"
    restart: unless-stopped
    networks:
      - datastream

networks:
  datastream:
    driver: bridge

volumes:
  datastream_db:
```

## Run

```bash
docker compose up -d
```

Open:

- `http://localhost:8080`

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
- Music library host path is configurable via `MUSIC_HOST_PATH` and is always mounted to fixed container path `/music`.
- Cover cache path is configurable via `COVERS_CACHE_PATH` (default: `/data/covers`).
- If you need HTTPS/HTTP/3, place an external reverse proxy in front later (Nginx/Caddy/Traefik/CDN).
- `apps/server/.env` is for non-Docker local backend runs only (`npm run start:dev` in `apps/server`).

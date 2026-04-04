# Docker

- **`docker-compose.yml`** — `mongo`, `backend`, `frontend` (nginx + SPA + `/api` reverse proxy).
- **`Dockerfile.backend`** — multi-stage build from monorepo root.
- **`Dockerfile.frontend`** — builds static assets, serves with nginx.

## Commands

From repository root:

```bash
docker compose -f docker/docker-compose.yml up --build
```

Override chain settings for the API container:

```bash
RPC_URL=https://... NFT_CONTRACT_ADDRESS=0x... docker compose -f docker/docker-compose.yml up --build
```

## Mongo credentials

Default dev user/password are in `docker-compose.yml` (`authentick` / `authentick_dev_password`). Change these for any shared environment.

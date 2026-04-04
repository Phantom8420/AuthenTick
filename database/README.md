# Database

MongoDB is the primary off-chain store for high-frequency EPCIS-style events and rich product metadata (see `docs/ARCHITECTURE.md` — hybrid on-chain + database).

## Files

| File | Purpose |
|------|---------|
| `mongo-init.js` | Runs on first `mongo` container start (creates app user + indexes when wired in compose). |
| `schemas/` | Reference JSON shapes for tooling and OpenAPI generation (optional). |

## Connection string

Default local URI:

`mongodb://localhost:27017/authentick`

Set `MONGODB_URI` in `backend/.env` (see `backend/.env.example`).

## Indexes

Mongoose models in `backend/src/models/` declare indexes. For production, review compound indexes for your query patterns (e.g. `productId` + `eventTime` for provenance timelines).

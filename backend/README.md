# AuthenTick API

Express + TypeScript service. See [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) for how it fits together.

## Run

```bash
cp .env.example .env
npm run dev          # from this folder, or: npm run dev -w backend from the repo root
```

Without `MONGODB_URI` the API uses an in-memory store. Production build:

```bash
npm run build && npm start
```

## Endpoints

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | Store, auth and chain status |
| POST | `/api/products` | Mint. Manufacturer role when auth is on |
| GET | `/api/products/:tokenId`, `/api/metadata/:tokenId` | `{ product, events, onChain? }` |
| POST | `/api/events` | `{ tokenId, bizStep, readPoint, actor? }`. Lifecycle and role checked |
| GET | `/api/events/product/:tokenId` | Event history |
| POST | `/api/verify/challenge` | `{ tokenId }` → `{ message }` to sign |
| POST | `/api/verify/ownership` | `{ tokenId, owner, message, signature }` → `{ verified, reason? }` |
| GET | `/api/auth/challenge` | Message to sign in with |
| POST | `/api/auth/login` | `{ message, signature }` → `{ token, address, role }` |
| GET | `/api/auth/me` | Current user |
| PUT | `/api/users/:address/role` | Admin only |

Errors are `{ "error": "message" }` with 400 (validation), 401/403 (auth), 404, or 409 (duplicate or out-of-order event).

## Test

```bash
npm test                                   # memory repository
MONGODB_TEST_URI=mongodb://localhost:27017/authentick_test npm test   # also runs the MongoDB tests
```

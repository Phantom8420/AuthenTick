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
| POST | `/api/products` | Mint. Manufacturer role when auth is on. `tokenId` is optional: left out, it is derived from GTIN + serial exactly as the contract does |
| GET | `/api/products/:tokenId`, `/api/metadata/:tokenId` | `{ product, events, onChain? }` |
| POST | `/api/events` | `{ tokenId, bizStep, readPoint, actor? }`. Lifecycle and role checked |
| GET | `/api/events/product/:tokenId` | Event history |
| POST | `/api/verify/challenge` | `{ tokenId }` → `{ message }` to sign |
| POST | `/api/verify/ownership` | `{ tokenId, owner, message, signature }` → `{ verified, reason? }` |
| GET | `/api/auth/challenge` | Message to sign in with |
| POST | `/api/auth/login` | `{ message, signature }` → `{ address, role }`; sets the httpOnly session cookie. Each challenge works once |
| POST | `/api/auth/logout` | Clears the session cookie |
| GET | `/api/auth/me` | Current user |
| PUT | `/api/users/:address/role` | Admin only |

Errors are `{ "error": "message" }` with 400 (validation), 401/403 (auth), 404, or 409 (duplicate or out-of-order event).

## Sessions

Sign-in sets an `httpOnly` cookie (`authentick_session`, `SameSite=Lax` by default, `Secure` in production), so page scripts never see the token. Because a cookie rides along on cross-site requests, writes made with it must also send `X-Requested-With: authentick`; the web app does this for you. Scripts can send `Authorization: Bearer <jwt>` instead and are not subject to that check. Set `COOKIE_SAMESITE=none` only when the app and API are on different sites (HTTPS required).

Challenges are single use. The used-nonce store is in memory, so with more than one API instance back it with a shared store.

## On-chain anchoring

Set `RPC_URL`, `NFT_CONTRACT_ADDRESS`, `REGISTRY_CONTRACT_ADDRESS` and `RELAYER_PRIVATE_KEY` and the API mirrors writes onto the contracts through the relayer wallet, which must hold the manufacturer, distributor and retailer roles (the Ignition module grants them to the deployer, or pass a `relayer` parameter). Minting mints the NFT and moves it to *Minted*; each lifecycle event advances the registry as far as that step reaches (`storing` and a repeat `shipping` change nothing on-chain). The chain goes first, so a revoked, cloned or out-of-order token is refused with `502` and nothing is recorded off-chain. Records then include `onChain.stage`.

The relayer is a trust assumption: the API decides who may do what, and the contracts enforce ordering and revocation. Try it end to end against a local node with `npm run smoke:chain` (starts Hardhat, deploys, runs a full product life, checks the contracts directly).

## Scan anomaly detection

Every product lookup counts as a scan. The API logs, per token and for the last 24 hours, which *network* each scan came from (the /24 of the IP, hashed with a server secret; addresses are never stored) and scores the pattern in `services/risk.ts`:

- **Spread:** a genuine label is read in a few places, a photocopied one shows up everywhere. Distinct networks above 4 (above 2 once the item is sold) raise the score.
- **Bursts:** more than 8 scans inside one minute looks like a script probing the code.

`score = 100 * (1 - exp(-(0.28 * spread + 0.12 * probing)))`, with 35 and 70 as the medium and high cut-offs. Lookups return `risk: { score, level, reasons, scans, sources }` and the web app shows it on the product page, flagging a likely clone. It is a transparent statistical model, not a trained network, so every reason traces back to a number. The history is in memory (with several API instances, move it to Redis). The in-browser demo mirrors the same function (`frontend/src/lib/risk.ts`); on the demo item, press *Simulate a cloned label*.

## Logs

One JSON line per request (`id`, `method`, `path`, `status`, `ms`, `user`); the id is also returned as `X-Request-Id`. Send your own `X-Request-Id` to trace a call across services.

## Test

```bash
npm test                                   # memory repository
MONGODB_TEST_URI=mongodb://localhost:27017/authentick_test npm test   # also runs the MongoDB tests
```

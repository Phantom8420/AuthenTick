# AuthenTick

**Blockchain-backed product authentication.** Mint a digital twin for every product, log each handoff on the supply chain, and let anyone scan to prove it's real.

**[Open the live app](https://frontend-rho-pearl-52.vercel.app)** · [Docs](https://frontend-rho-pearl-52.vercel.app/docs) · [Architecture](docs/ARCHITECTURE.md)

> No backend or wallet needed to try it. On the Verify page, paste the demo token `0xde70a11ce0000001` into the search bar and step the item from factory to shopper.

## How it works

1. **Mint**: a manufacturer registers a serialized product (GTIN + serial). It becomes a digital twin with a printable QR code.
2. **Hand off**: distributors and retailers log shipping, receiving, storing and selling as GS1 EPCIS events.
3. **Verify**: a shopper scans the QR code or searches the token ID and sees the full provenance trail.
4. **Own**: the buyer connects a wallet to confirm they are the registered owner.

## Roles and rules

Writes need a wallet sign-in when `AUTH_REQUIRED=true` (the default in production). Each role does one job:

| Role | Can record |
|---|---|
| Manufacturer | mint, shipping |
| Distributor | shipping, receiving |
| Retailer | receiving, storing, selling |
| Admin | everything, plus granting roles |

Events must follow the lifecycle: `commissioning → shipping → receiving → storing → selling`, with `shipping` allowed again after receiving or storing. A sold item is final. GTINs are checked against the GS1 check digit, and a token ID or GTIN + serial can only be registered once.

## Repository layout

| Folder | What it is |
|---|---|
| `frontend/` | React 19 + Vite + TypeScript web app. Includes an in-browser demo mode, so it runs with no API. |
| `backend/` | Express + TypeScript API. MongoDB in production, in-memory store for local development. |
| `contracts/` | Solidity (Hardhat 3): `RoleManager`, `AuthenTickNFT`, `OwnershipRegistry`. |
| `docker/` | Compose stack: MongoDB, API, nginx-served frontend. |
| `docs/` | Architecture notes. |

## Run it locally

Requires Node 20+.

```bash
git clone https://github.com/Phantom8420/AuthenTick.git
cd AuthenTick
npm install
npm run dev
```

The web app is on http://localhost:5173 and the API on http://localhost:4000. Without `MONGODB_URI` the API keeps data in memory. If the API is unreachable the frontend falls back to demo mode automatically.

Copy `backend/.env.example` to `backend/.env` to configure the API (MongoDB, wallet sign-in, chain).

### Everything in Docker

```bash
JWT_SECRET=$(openssl rand -hex 32) ADMIN_ADDRESSES=0xYourWallet npm run docker:up
```

The stack serves the app on http://localhost:8080. In production mode the API requires a wallet sign-in for writes; `ADMIN_ADDRESSES` can then grant roles.

### Tests

```bash
npm test                 # all workspaces
npm run test:contracts   # Hardhat
npm run test:backend     # Vitest
npm run test:frontend    # Vitest
```

## Deploying the frontend

`frontend/vercel.json` rewrites all routes to the SPA. Build with `npm run build -w frontend` and deploy `frontend/dist` to any static host. Set `VITE_API_URL` to point at a hosted API; without it the app runs in demo mode.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Issues and pull requests are welcome.

## License

[MIT](LICENSE)

# AuthenTick API

Express service implementing architecture pieces:

- **GS1 EPCIS ingestion** — `POST /api/events`, `GET /api/events/product/:productId`
- **Metadata API** — `GET /api/metadata/:tokenId`
- **ZK stub** — `POST /api/verify/ownership`
- **Products** — `POST /api/products`, `GET /api/products/:tokenId` (Mongo + optional on-chain read via Ethers)

## Env

Copy `.env.example` to `.env`.

## Run

```bash
npm run dev
```

Build & run production bundle:

```bash
npm run build && npm start
```

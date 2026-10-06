# AuthenTick architecture

AuthenTick is a hybrid system. Ownership and authenticity are anchored on a public ledger, while high-frequency supply-chain events live in a database.

```
 Browser (React) ──► API (Express) ──► MongoDB   events, product records, roles
        │                 │
        │                 └──► RPC ──► AuthenTickNFT   ownerOf, isAuthentic (optional)
        └── wallet ─────────────────► sign-in and ownership proofs (personal_sign)
```

## Smart contracts (`contracts/`)

| Contract | Responsibility |
|---|---|
| `RoleManager` | Single source of truth for the manufacturer, distributor and retailer roles. |
| `AuthenTickNFT` | ERC-721 digital twin. The token id is `keccak256(abi.encode(gtin, serial))`, so an item can be minted once. Manufacturers (or admins) can revoke a product as no longer authentic. |
| `OwnershipRegistry` | Coarse lifecycle stage per token: Minted → InDistribution → AtRetail → ConsumerOwned. Moves one step at a time, needs the matching role, and freezes revoked products. |

## API (`backend/`)

- **Repository layer.** `Repository` has a MongoDB implementation and an in-memory one (used when `MONGODB_URI` is unset). Both pass the same contract tests.
- **Lifecycle rules.** `domain/lifecycle.ts` defines which GS1 EPCIS business step may follow which. Advancing a product is a compare-and-set on its last step, so concurrent writers cannot both win.
- **GTIN validation.** `domain/gtin.ts` checks the GS1 check digit.
- **Wallet auth.** The server issues a stateless, HMAC-signed challenge. The wallet signs it, the server recovers the address, looks up the role, and sets a 12 hour JWT in an `httpOnly` cookie (writes also need an anti-CSRF header). Each challenge is accepted once. Writes are role-checked when `AUTH_REQUIRED` is on.
- **On-chain anchoring.** With a relayer key configured, minting and each lifecycle event are mirrored to `AuthenTickNFT` and `OwnershipRegistry` before they are recorded off-chain, so the contracts have the final say on duplicates, ordering and revocation. See [backend/README.md](../backend/README.md#on-chain-anchoring).
- **Ownership proofs.** A per-product challenge is signed by the claimed owner. The server checks the signature and compares the address with the registered owner, or with `ownerOf` on-chain when `RPC_URL` and `NFT_CONTRACT_ADDRESS` are set.

## Frontend (`frontend/`)

React 19 + Vite. If the API cannot be reached, the app switches to an in-browser mock (`lib/mockApi.ts`) that applies the same rules and keeps data in `localStorage`. The demo token `0xde70a11ce0000001` always resolves locally, so anyone can try the full journey from the Verify search bar.

## Data flow: verifying a product

1. A shopper scans the QR code or enters the token ID.
2. The app fetches `/api/metadata/:tokenId`: product, events, and the on-chain view when configured.
3. The record is shown with its provenance timeline and current status.
4. To prove ownership, the wallet signs a challenge and the API checks the signature against the registered owner.

## GS1 EPCIS

Events follow the EPCIS who/what/when/where/why model: product (GTIN + serial), event time, read point (GLN), and business step (`urn:epcglobal:cbv:bizstep:*`).

## Not built yet

Zero-knowledge ownership proofs, batch anchoring of events to a rollup, and a hosted API with a deployed testnet contract set. The signature-based proof above is the current mechanism.

# AuthenTick smart contracts

Solidity stack aligned with `docs/ARCHITECTURE.md`:

| Contract | Role |
|----------|------|
| `AuthenTickNFT.sol` | ERC-721 digital twin (GTIN + serial, manufacturer mint). |
| `RoleManager.sol` | RBAC registry for supply-chain actors. |
| `OwnershipRegistry.sol` | On-chain lifecycle stage per token (Mint → distribution → retail → consumer). |

## Setup

```bash
cd contracts   # or from repo root: npm install
npm install
npm run build
npm test
```

## Deploy (Ignition)

Set `contracts/.env` from `.env.example` for Sepolia, then:

```bash
npm run deploy:sepolia
```

Local EDR network:

```bash
npm run deploy:local
```

## OpenZeppelin

Contracts use `@openzeppelin/contracts` (declared in this package’s `package.json`).

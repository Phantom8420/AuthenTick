# AuthenTick smart contracts

Solidity stack described in [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md):

| Contract | Role |
|----------|------|
| `RoleManager.sol` | Shared manufacturer, distributor and retailer roles. |
| `AuthenTickNFT.sol` | ERC-721 digital twin. Token id is `keccak256(abi.encode(gtin, serial))`; manufacturers can mint and revoke. |
| `OwnershipRegistry.sol` | Lifecycle stage per token. One step at a time, role-gated, frozen when revoked. |

## Setup

```bash
cd contracts   # or from repo root: npm install
npm install
npm run build
npm test      # runs each test file in its own Hardhat process
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

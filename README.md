# AuthenTick 🛡️

**AuthenTick** is a hybrid blockchain-based anti-counterfeit platform designed to combat supply chain fraud. It combines the immutability of public ledgers with the scalability of high-performance centralized databases to verify product authenticity seamlessly.

Through a beautiful, dark-themed interface, Manufacturers can mint serialized "Digital Twins" (NFTs), Distributors and Retailers can track shipments, and Consumers can confidently verify products by scanning secure QR codes. 

---

## 🌟 Key Features

- **Digital Twin Minting**: Generate non-fungible tokens (ERC-721) securely mapping to physical product serial numbers.
- **GS1 EPCIS Compliance**: Leverage global supply chain standards (GTINs, GLNs) for interoperability and standardized event tracking.
- **Hybrid Data Architecture**: Store high-frequency tracking events off-chain (MongoDB) while executing critical ownership transfers on-chain (Ethereum/Polygon).
- **Consumer Verification**: Instantly scan QR codes to confirm authenticity, revealing full supply-chain provenance.
- **Zero-Knowledge Capabilities (ZK-Proofs)**: Prepare the system for private ownership verifications, guaranteeing authenticity without revealing personal information.
- **Role-Based Access Control (RBAC)**: Distinct, secure interfaces for Manufacturers, Distributors, Retailers, and Customers.

---

## 🏛️ System Architecture

AuthenTick comprises three primary layers operating cohesively:

1. **Smart Contracts (On-Chain)**
   - `AuthenTickNFT` (ERC-721): The core token representing the physical item.
   - `OwnershipRegistry`: Controls product lifecycles across the entire supply chain.
   - `RoleManager`: Handles blockchain-verified permissions.

2. **Backend Services (Off-Chain)**
   - **Ingestion Engine**: Processes GTINs and handles high-velocity tracking data.
   - **Metadata API**: Serves robust product details and supply chain histories globally.

3. **Frontend Applications**
   - **Manufacturer Portal**: Simplified batch minting and initial lifecycle processing.
   - **Supply Chain Dashboard**: Visual tracking interface for logistics.
   - **Consumer UI**: Frictionless, mobile-responsive verification interface.

For a deeper dive, check out the [ARCHITECTURE documentation](./docs/ARCHITECTURE.md).

---

## 🛠️ Technology Stack

An enterprise-ready mono-repo managed with npm workspaces:

### Frontend (`frontend/`)
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4, Framer Motion
- **Web3 Integration:** Ethers.js, viem
- **Utilities:** HTML5-QRCode, React Router DOM

### Backend (`backend/`)
- **Server:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **Validation:** Zod
- **Security:** Helmet, CORS

### Smart Contracts (`contracts/`)
- **Environment:** Hardhat, NomicFoundation Verification
- **Language:** Solidity 
- **Standards:** OpenZeppelin Contracts
- **Deployment:** Hardhat Ignition

---

## 🚀 Getting Started

Follow these steps to run AuthenTick locally.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- [Docker](https://www.docker.com/) & Docker Compose (for local database services)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/authentick.git
   cd authentick
   ```

2. **Install all workspace dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Copy the example environment files. Modify them as necessary if integrating Firebase or Gemini API.
   ```bash
   cp .env.example .env
   ```

### Running the Application

AuthenTick provides unified scripts via `concurrently` to bring the stack up effortlessly.

**Option A: The Full Stack (Recommended)**
Spins up MongoDB in Docker and starts both the `frontend` and `backend` development servers.
```bash
npm run dev:stack
```

**Option B: Separate the DB and App**
Start your Docker services manually:
```bash
npm run docker:up
```
Then start the Node.js development servers:
```bash
npm run dev
```

The frontend will be available locally (typically at `http://localhost:5173`), and the backend API will run on its designated port.

### Smart Contracts (Local Blockchain)

To spin up a local Hardhat node for smart contract testing:
```bash
npm run node:chain
```

In a new terminal window, deploy the contracts to your local node:
```bash
npm run deploy:local -w contracts
```

---

## 📂 Project Structure

```text
authentick/
├── apps/               # Additional standalone services/apps
├── backend/            # Express.js REST API & Ingestion engine
├── contracts/          # Hardhat configuration, smart contracts, & Ignition
├── docker/             # Docker compose files for MongoDB / infrastructure
├── docs/               # System documentation and architecture diagrams
├── frontend/           # React + Tailwind CSS client application
├── package.json        # Root workspace configuration
└── README.md           # You are here!
```

---

## 📜 Available Scripts

From the root directory, you have access to the following workspace scripts:

- `npm run dev`: Starts the backend API and frontend concurrently.
- `npm run dev:stack`: Wakes the Docker MongoDB instance, then runs the `dev` script.
- `npm run build`: Compiles smart contracts, backend, and frontend for production.
- `npm run lint`: Runs TypeScripts/Eslint checks across all relevant workspaces.
- `npm run test:contracts`: Executes the Hardhat/Foundry test suites inside `contracts/`.
- `npm run docker:up` / `npm run docker:down`: Manage the background container infrastructure.

---

## 📄 License

This project is licensed under the ISC License. See the internal package files for specific details.

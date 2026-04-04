# AuthenTick Architecture

## 1. System Overview
AuthenTick is a hybrid blockchain-based anti-counterfeit system that combines the immutability of public ledgers with the scalability of centralized high-performance databases.

## 2. Component Breakdown

### A. Smart Contracts (On-Chain)
- **AuthenTickNFT (ERC-721)**: Represents the "Digital Twin" of a physical product.
- **OwnershipRegistry**: Manages the lifecycle of a product (Mint -> Distribute -> Retail -> Own).
- **RoleManager**: Implements RBAC (Manufacturer, Distributor, Retailer, Customer).

### B. Backend Services (Off-Chain)
- **GS1 EPCIS Ingestion Engine**: Standardizes product event data.
- **ZK-Prover Service**: Generates zero-knowledge proofs for ownership verification without revealing user PII.
- **Metadata API**: Serves high-resolution product data and history.

### C. Frontend Applications
- **Manufacturer Portal**: Batch minting and serial generation.
- **Supply Chain Dashboard**: Tracking transfers between distributors and retailers.
- **Consumer App**: QR-based verification and ownership claiming.

## 3. Data Flow (Verification)
1. **Product Scan**: Consumer scans the secure QR code.
2. **Identity Fetch**: App retrieves the NFT ID and associated GS1 events.
3. **ZK-Proof Verification**: The backend verifies the current owner's signature against the on-chain registry using a ZK-proof.
4. **Authenticity Result**: User sees the full provenance and "Verified" status.

## 4. GS1 EPCIS Interoperability
We use the **Electronic Product Code Information Services (EPCIS)** standard to ensure interoperability with global supply chains.
- **What**: Product ID (GTIN + Serial).
- **When**: Timestamp of events.
- **Where**: Location (GLN).
- **Why**: Business step (e.g., shipping, receiving).

## 5. Scalability (2000+ TPS)
- **Batching**: Minting and state updates are batched off-chain and committed to Polygon in periodic intervals.
- **Hybrid State**: High-frequency tracking events are stored in Firestore, while critical ownership changes are on-chain.

import { Contract, JsonRpcProvider, NonceManager, Wallet } from "ethers";
import type { Env } from "./env.js";

export const nftAbi = [
  "function getProduct(uint256 tokenId) view returns (tuple(string gtin, string serial, uint256 batchId, uint256 createdAt, address manufacturer, bool isVerified))",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function isAuthentic(uint256 tokenId) view returns (bool)",
  "function tokenIdFor(string gtin, string serial) pure returns (uint256)",
  "function mintProduct(address to, string gtin, string serial, uint256 batchId) returns (uint256)",
  "error NotManufacturer()",
  "error AlreadyMinted(uint256 tokenId)",
  "error InvalidInput()",
] as const;

export const registryAbi = [
  "function stageOf(uint256 tokenId) view returns (uint8)",
  "function advance(uint256 tokenId) returns (uint8)",
  "error UnknownProduct(uint256 tokenId)",
  "error ProductRevoked(uint256 tokenId)",
  "error InvalidTransition(uint8 from, uint8 to)",
  "error MissingRole(bytes32 role)",
] as const;

export interface Chain {
  /** Read access to the NFT contract. */
  nft: Contract;
  /** Read access to the registry, when its address is configured. */
  registry?: Contract;
  /** Present when a relayer key and registry address are configured. */
  write?: { nft: Contract; registry: Contract; relayer: string };
}

export function createChain(env: Env): Chain | null {
  if (!env.RPC_URL || !env.NFT_CONTRACT_ADDRESS) return null;
  const provider = new JsonRpcProvider(env.RPC_URL);
  const nft = new Contract(env.NFT_CONTRACT_ADDRESS, nftAbi, provider);
  if (!env.REGISTRY_CONTRACT_ADDRESS) return { nft };
  const registry = new Contract(env.REGISTRY_CONTRACT_ADDRESS, registryAbi, provider);
  if (!env.RELAYER_PRIVATE_KEY) return { nft, registry };

  // NonceManager keeps back-to-back transactions from colliding
  const signer = new NonceManager(new Wallet(env.RELAYER_PRIVATE_KEY, provider));
  const relayer = new Wallet(env.RELAYER_PRIVATE_KEY).address;
  return {
    nft,
    registry,
    write: {
      nft: new Contract(env.NFT_CONTRACT_ADDRESS, nftAbi, signer),
      registry: new Contract(env.REGISTRY_CONTRACT_ADDRESS, registryAbi, signer),
      relayer,
    },
  };
}

import { JsonRpcProvider, Contract } from "ethers";
import type { Env } from "./env.js";

const nftAbi = [
  "function getProduct(uint256 tokenId) view returns (tuple(string gtin, string serial, uint256 batchId, uint256 createdAt, address manufacturer, bool isVerified))",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function isAuthentic(uint256 tokenId) view returns (bool)",
] as const;

export function createNftClient(env: Env): Contract | null {
  if (!env.RPC_URL || !env.NFT_CONTRACT_ADDRESS) return null;
  return new Contract(env.NFT_CONTRACT_ADDRESS, nftAbi, new JsonRpcProvider(env.RPC_URL));
}

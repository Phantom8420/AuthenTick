import { JsonRpcProvider, Contract } from "ethers";
import type { Env } from "./env.js";

const minimalNftAbi = [
  "function getProduct(uint256 tokenId) view returns (tuple(string gtin, string serial, uint256 batchId, uint256 createdAt, bool isVerified))",
  "function ownerOf(uint256 tokenId) view returns (address)",
] as const;

export function createBlockchainClients(env: Env) {
  if (!env.RPC_URL || !env.NFT_CONTRACT_ADDRESS) {
    return { provider: null, nft: null as Contract | null };
  }
  const provider = new JsonRpcProvider(env.RPC_URL);
  const nft = new Contract(env.NFT_CONTRACT_ADDRESS, minimalNftAbi, provider);
  return { provider, nft };
}

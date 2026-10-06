import type { Contract } from "ethers";

export type OnChainProduct = {
  owner: string;
  manufacturer: string;
  isAuthentic: boolean;
};

/** Reads the token from the NFT contract. Null when the chain is not configured or the token is unknown. */
export async function readOnChainProduct(nft: Contract | null, tokenId: string): Promise<OnChainProduct | null> {
  if (!nft) return null;
  try {
    const id = BigInt(tokenId);
    const [meta, owner, authentic] = await Promise.all([nft.getProduct(id), nft.ownerOf(id), nft.isAuthentic(id)]);
    return { owner: owner as string, manufacturer: meta.manufacturer as string, isAuthentic: authentic as boolean };
  } catch {
    return null;
  }
}

import type { Contract } from "ethers";
import { STAGE_NAMES } from "./anchor.js";

export type OnChainProduct = {
  owner: string;
  manufacturer: string;
  isAuthentic: boolean;
  /** Registry stage, when the registry is configured. */
  stage?: string;
};

/** Reads the token from the NFT contract. Null when the chain is not configured or the token is unknown. */
export async function readOnChainProduct(
  nft: Contract | null,
  tokenId: string,
  registry: Contract | null = null,
): Promise<OnChainProduct | null> {
  if (!nft) return null;
  try {
    const id = BigInt(tokenId);
    const [meta, owner, authentic, stage] = await Promise.all([
      nft.getProduct(id),
      nft.ownerOf(id),
      nft.isAuthentic(id),
      registry ? registry.stageOf(id) : Promise.resolve(null),
    ]);
    return {
      owner: owner as string,
      manufacturer: meta.manufacturer as string,
      isAuthentic: authentic as boolean,
      ...(stage === null ? {} : { stage: STAGE_NAMES[Number(stage)] }),
    };
  } catch {
    return null;
  }
}

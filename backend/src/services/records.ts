import type { Deps } from "../http.js";
import { readOnChainProduct } from "./blockchainService.js";

/** Product, its events and (when a chain is configured) the on-chain view. Null when unknown. */
export async function loadRecord({ repo, nft, registry }: Deps, tokenId: string) {
  const product = await repo.getProduct(tokenId);
  if (!product) return null;
  const [events, onChain] = await Promise.all([repo.listEvents(tokenId), readOnChainProduct(nft, tokenId, registry)]);
  return { product, events, ...(onChain ? { onChain } : {}) };
}

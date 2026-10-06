import type { Request } from "express";
import type { Deps } from "../http.js";
import { readOnChainProduct } from "./blockchainService.js";
import { assessRisk, sourceOf } from "./risk.js";

/**
 * Product, its events, the on-chain view (when a chain is configured) and a scan
 * risk score. Looking a product up counts as a scan. Null when unknown.
 */
export async function loadRecord({ repo, nft, registry, scans, env }: Deps, tokenId: string, req?: Request) {
  const product = await repo.getProduct(tokenId);
  if (!product) return null;
  if (req) scans.record(tokenId, sourceOf(req.ip, env.JWT_SECRET));
  const [events, onChain] = await Promise.all([repo.listEvents(tokenId), readOnChainProduct(nft, tokenId, registry)]);
  const risk = assessRisk(scans.list(tokenId), product.status);
  return { product, events, risk, ...(onChain ? { onChain } : {}) };
}

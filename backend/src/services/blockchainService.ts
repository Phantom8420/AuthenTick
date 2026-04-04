import type { Contract } from "ethers";

type OnChainProduct = {
  gtin: string;
  serial: string;
  batchId: string;
  createdAt: number;
  isVerified: boolean;
  owner: string;
};

export async function readOnChainProduct(nft: Contract | null, tokenId: string): Promise<OnChainProduct | null> {
  if (!nft) return null;
  try {
    const id = BigInt(tokenId);
    const raw = await nft.getProduct(id);
    const meta = raw as unknown as {
      gtin: string;
      serial: string;
      batchId: bigint;
      createdAt: bigint;
      isVerified: boolean;
    };
    const owner = (await nft.ownerOf(id)) as string;
    return {
      gtin: meta.gtin,
      serial: meta.serial,
      batchId: meta.batchId.toString(),
      createdAt: Number(meta.createdAt),
      isVerified: meta.isVerified,
      owner,
    };
  } catch {
    return null;
  }
}

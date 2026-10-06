import { AbiCoder, id, isAddress, keccak256 } from "ethers";
import type { BizStep } from "../domain/lifecycle.js";
import type { Chain } from "../config/blockchain.js";
import { HttpError } from "../errors.js";

/** How far along the on-chain registry a step takes a token (1 Minted … 4 ConsumerOwned). */
export const TARGET_STAGE: Record<BizStep, number> = {
  commissioning: 1,
  shipping: 2,
  receiving: 3,
  storing: 3,
  selling: 4,
};

export const STAGE_NAMES = ["None", "Minted", "InDistribution", "AtRetail", "ConsumerOwned"] as const;

/** Same derivation as AuthenTickNFT.tokenIdFor, so ids can be computed without a call. */
export const deriveTokenId = (gtin: string, serial: string) =>
  "0x" + BigInt(keccak256(AbiCoder.defaultAbiCoder().encode(["string", "string"], [gtin, serial]))).toString(16);

/** The contract stores the batch as a number; free-form batch codes are hashed into one. */
export const batchToUint = (batchId: string) => (/^\d{1,30}$/.test(batchId) ? BigInt(batchId) : BigInt(id(batchId)));

const chainError = (e: unknown) => {
  const msg = (e as { shortMessage?: string; reason?: string; message?: string }) ?? {};
  return new HttpError(502, `On-chain anchoring failed: ${msg.reason ?? msg.shortMessage ?? msg.message ?? "unknown error"}`);
};

/**
 * Mirrors the off-chain lifecycle onto the chain through a relayer wallet.
 * The API checks who may do what; the contracts enforce ordering and revocation,
 * so a revoked or out-of-order product is refused even if the database allowed it.
 */
export class Anchor {
  constructor(private readonly write: NonNullable<Chain["write"]>) {}

  get relayer() {
    return this.write.relayer;
  }

  async mint(owner: string, gtin: string, serial: string, batchId: string) {
    const to = isAddress(owner) ? owner : this.write.relayer;
    try {
      const tx = await this.write.nft.mintProduct(to, gtin, serial, batchToUint(batchId));
      await tx.wait();
      await this.advanceTo(BigInt(deriveTokenId(gtin, serial)), TARGET_STAGE.commissioning);
    } catch (e) {
      throw chainError(e);
    }
  }

  async record(tokenId: string, step: BizStep) {
    try {
      await this.advanceTo(BigInt(tokenId), TARGET_STAGE[step]);
    } catch (e) {
      throw chainError(e);
    }
  }

  async stage(tokenId: string): Promise<number> {
    return Number(await this.write.registry.stageOf(BigInt(tokenId)));
  }

  /** Moves the token forward until it reaches `target`. Never moves it backwards. */
  private async advanceTo(tokenId: bigint, target: number) {
    let stage = Number(await this.write.registry.stageOf(tokenId));
    while (stage < target) {
      await (await this.write.registry.advance(tokenId)).wait();
      stage++;
    }
  }
}

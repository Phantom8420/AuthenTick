import { AbiCoder, type Contract, id, isAddress, keccak256 } from "ethers";
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

type EthersError = { reason?: string; shortMessage?: string; message?: string; error?: { message?: string }; info?: { error?: { message?: string } } };

const chainError = (e: unknown) => {
  const err = (e ?? {}) as EthersError;
  // ethers wraps node errors it cannot decode; the useful text is one level down
  const why = err.reason ?? err.info?.error?.message ?? err.error?.message ?? err.shortMessage ?? err.message ?? "unknown error";
  return new HttpError(502, `On-chain anchoring failed: ${why}`);
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
      const args = [to, gtin, serial, batchToUint(batchId)];
      await (await this.write.nft.mintProduct(...args, await this.gas(this.write.nft, "mintProduct", args))).wait();
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

  /** Estimates are tight when a call fans out to other contracts, so leave headroom. */
  private async gas(contract: Contract, fn: string, args: unknown[]) {
    const estimate = await contract.getFunction(fn).estimateGas(...args);
    return { gasLimit: (estimate * 13n) / 10n };
  }

  /** Moves the token forward until it reaches `target`. Never moves it backwards. */
  private async advanceTo(tokenId: bigint, target: number) {
    let stage = Number(await this.write.registry.stageOf(tokenId));
    while (stage < target) {
      await (await this.write.registry.advance(tokenId, await this.gas(this.write.registry, "advance", [tokenId]))).wait();
      stage++;
    }
  }
}

import { describe, expect, it } from "vitest";
import { Wallet } from "ethers";
import request from "supertest";
import { createApp } from "../app.js";
import { loadEnv } from "../config/env.js";
import type { Chain } from "../config/blockchain.js";
import { MemoryRepo } from "../repo/memoryRepo.js";
import { Anchor, TARGET_STAGE, batchToUint, deriveTokenId } from "./anchor.js";

/** A stand-in for the registry/NFT contracts that records calls and can be told to fail. */
function fakeChain(opts: { failAdvance?: boolean } = {}) {
  const stages = new Map<string, number>();
  const calls: string[] = [];
  const tx = { wait: async () => ({}) };
  const write = {
    relayer: Wallet.createRandom().address,
    nft: {
      mintProduct: async (to: string, gtin: string, serial: string) => {
        calls.push(`mint:${to}:${gtin}:${serial}`);
        return tx;
      },
    },
    registry: {
      stageOf: async (id: bigint | string) => stages.get(String(id)) ?? 0,
      advance: async (id: bigint | string) => {
        if (opts.failAdvance) throw Object.assign(new Error("x"), { reason: "ProductRevoked" });
        stages.set(String(id), (stages.get(String(id)) ?? 0) + 1);
        calls.push(`advance:${String(id)}`);
        return tx;
      },
    },
  };
  return { chain: { nft: write.nft, write } as unknown as Chain, calls, stages };
}

const maker = Wallet.createRandom();
const body = { name: "Watch", gtin: "04012345678901", serial: "SN-1", batchId: "B1", manufacturerId: maker.address };
const evt = (tokenId: string, key: string) => ({ tokenId, bizStep: `urn:epcglobal:cbv:bizstep:${key}`, readPoint: "gln:1" });
const env = loadEnv({ NODE_ENV: "test", AUTH_REQUIRED: "false", JWT_SECRET: "test-secret-test-secret" });

describe("token ids and batches", () => {
  it("derives a stable id from gtin + serial", () => {
    expect(deriveTokenId("04012345678901", "SN-1")).toBe(deriveTokenId("04012345678901", "SN-1"));
    expect(deriveTokenId("04012345678901", "SN-1")).not.toBe(deriveTokenId("04012345678901", "SN-2"));
    // ("1","23") and ("12","3") must not collide
    expect(deriveTokenId("1", "23")).not.toBe(deriveTokenId("12", "3"));
  });

  it("keeps numeric batches and hashes free-form ones", () => {
    expect(batchToUint("42")).toBe(42n);
    expect(batchToUint("LOT-A")).toBeGreaterThan(2n ** 64n);
  });
});

describe("on-chain anchoring", () => {
  it("mints, then walks the registry as the lifecycle moves", async () => {
    const { chain, calls, stages } = fakeChain();
    const api = request(createApp(env, new MemoryRepo(), chain));

    const minted = await api.post("/api/products").send(body);
    expect(minted.status).toBe(201);
    const id = BigInt(minted.body.tokenId).toString();
    expect(calls[0]).toMatch(/^mint:/);
    expect(stages.get(id)).toBe(TARGET_STAGE.commissioning);

    for (const [step, stage] of [["shipping", 2], ["receiving", 3], ["storing", 3], ["selling", 4]] as const) {
      expect((await api.post("/api/events").send(evt(minted.body.tokenId, step))).status).toBe(201);
      expect(stages.get(id)).toBe(stage);
    }
    // storing did not advance a second time
    expect(calls.filter((c) => c.startsWith("advance")).length).toBe(4);
  });

  it("does not move the chain backwards when a product ships again", async () => {
    const { chain, stages } = fakeChain();
    const api = request(createApp(env, new MemoryRepo(), chain));
    const { body: p } = await api.post("/api/products").send(body);
    for (const s of ["shipping", "receiving", "shipping"]) await api.post("/api/events").send(evt(p.tokenId, s));
    expect(stages.get(BigInt(p.tokenId).toString())).toBe(3);
  });

  it("insists the token id matches the contract's derivation", async () => {
    const { chain } = fakeChain();
    const res = await request(createApp(env, new MemoryRepo(), chain)).post("/api/products").send({ ...body, tokenId: "0x1234" });
    expect(res.status).toBe(400);
  });

  it("returns 502 and records nothing when the contract refuses", async () => {
    const repo = new MemoryRepo();
    const { chain } = fakeChain();
    const api = request(createApp(env, repo, chain));
    const { body: p } = await api.post("/api/products").send(body);

    const failing = request(createApp(env, repo, fakeChain({ failAdvance: true }).chain));
    const res = await failing.post("/api/events").send(evt(p.tokenId, "shipping"));
    expect(res.status).toBe(502);
    expect(res.body.error).toMatch(/ProductRevoked/);
    expect((await repo.listEvents(p.tokenId)).length).toBe(1);
  });
});

describe("Anchor", () => {
  it("falls back to the relayer when the owner is not a wallet address", async () => {
    const { chain, calls } = fakeChain();
    await new Anchor(chain.write!).mint("some-company", "04012345678901", "S", "1");
    expect(calls[0]).toContain(chain.write!.relayer);
  });
});

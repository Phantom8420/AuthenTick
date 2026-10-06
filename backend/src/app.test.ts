import request from "supertest";
import { Wallet, type BaseWallet } from "ethers";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { loadEnv } from "./config/env.js";
import { MemoryRepo } from "./repo/memoryRepo.js";

const admin = Wallet.createRandom();
const maker = Wallet.createRandom();
const shop = Wallet.createRandom();

const env = (extra: Record<string, string> = {}) =>
  loadEnv({ NODE_ENV: "test", JWT_SECRET: "test-secret-test-secret", ADMIN_ADDRESSES: admin.address, ...extra });

const product = (over: Record<string, unknown> = {}) => ({
  tokenId: "0xabc123",
  name: "Chronograph",
  gtin: "04012345678901",
  serial: "SN-1",
  batchId: "B1",
  manufacturerId: "maker",
  ...over,
});

const step = (tokenId: string, bizStep: string) => ({ tokenId, bizStep, readPoint: "gln:1", actor: "actor" });

describe("open mode (local development)", () => {
  let api: ReturnType<typeof request>;
  beforeEach(() => {
    api = request(createApp(env({ AUTH_REQUIRED: "false" }), new MemoryRepo()));
  });

  it("reports health", async () => {
    const res = await api.get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "ok", store: "memory", authRequired: false });
  });

  it("mints a product and returns its record", async () => {
    const res = await api.post("/api/products").send(product());
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ tokenId: "0xabc123", status: "PRODUCTION" });

    const meta = await api.get("/api/metadata/0xABC123");
    expect(meta.status).toBe(200);
    expect(meta.body.events).toHaveLength(1);
    expect(meta.body.events[0].bizStep).toBe("urn:epcglobal:cbv:bizstep:commissioning");
  });

  it("refuses to overwrite an existing token", async () => {
    await api.post("/api/products").send(product());
    const res = await api.post("/api/products").send(product({ name: "Fake" }));
    expect(res.status).toBe(409);
    expect((await api.get("/api/metadata/0xabc123")).body.product.name).toBe("Chronograph");
  });

  it("rejects an invalid gtin check digit with a readable message", async () => {
    const res = await api.post("/api/products").send(product({ gtin: "04012345678902" }));
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/gtin/i);
  });

  it("enforces the lifecycle order", async () => {
    await api.post("/api/products").send(product());

    const early = await api.post("/api/events").send(step("0xabc123", "storing"));
    expect(early.status).toBe(409);
    expect(early.body.error).toMatch(/Next allowed: shipping/);

    for (const s of ["shipping", "receiving", "storing", "selling"]) {
      const res = await api.post("/api/events").send(step("0xabc123", `urn:epcglobal:cbv:bizstep:${s}`));
      expect(res.status).toBe(201);
    }
    const meta = await api.get("/api/metadata/0xabc123");
    expect(meta.body.product.status).toBe("SOLD");
    expect(meta.body.events).toHaveLength(5);

    const after = await api.post("/api/events").send(step("0xabc123", "shipping"));
    expect(after.status).toBe(409);
  });

  it("rejects unknown steps, commissioning by hand, and unknown products", async () => {
    await api.post("/api/products").send(product());
    expect((await api.post("/api/events").send(step("0xabc123", "teleporting"))).status).toBe(400);
    expect((await api.post("/api/events").send(step("0xabc123", "commissioning"))).status).toBe(400);
    expect((await api.post("/api/events").send(step("0xdead", "shipping"))).status).toBe(404);
  });

  it("answers 404 for unknown or malformed token ids", async () => {
    expect((await api.get("/api/metadata/0xnothing")).status).toBe(404);
    expect((await api.get("/api/metadata/not-a-token")).status).toBe(404);
    expect((await api.get("/api/events/product/0x99")).status).toBe(404);
  });
});

describe("auth required", () => {
  let api: ReturnType<typeof request>;
  const login = async (wallet: BaseWallet) => {
    const { message } = (await api.get("/api/auth/challenge")).body;
    const signature = await wallet.signMessage(message);
    const res = await api.post("/api/auth/login").send({ message, signature });
    return res;
  };

  beforeEach(() => {
    api = request(createApp(env({ AUTH_REQUIRED: "true" }), new MemoryRepo()));
  });

  it("blocks writes when signed out", async () => {
    expect((await api.post("/api/products").send(product())).status).toBe(401);
  });

  it("gives a plain wallet the customer role and blocks minting", async () => {
    const res = await login(maker);
    expect(res.body.role).toBe("CUSTOMER");
    const mint = await api.post("/api/products").set("Authorization", `Bearer ${res.body.token}`).send(product());
    expect(mint.status).toBe(403);
  });

  it("lets an admin grant roles, then each role does only its own job", async () => {
    const adminToken = (await login(admin)).body.token;
    expect((await login(admin)).body.role).toBe("ADMIN");

    for (const [wallet, role] of [[maker, "MANUFACTURER"], [shop, "RETAILER"]] as const) {
      const res = await api
        .put(`/api/users/${wallet.address}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role });
      expect(res.status).toBe(200);
    }

    const makerToken = (await login(maker)).body.token;
    const shopToken = (await login(shop)).body.token;
    const as = (t: string) => ({ Authorization: `Bearer ${t}` });

    const mint = await api.post("/api/products").set(as(makerToken)).send(product({ manufacturerId: "spoofed" }));
    expect(mint.status).toBe(201);
    // recorded under the signed-in wallet, not whatever the client claimed
    expect(mint.body.manufacturerId).toBe(maker.address.toLowerCase());

    // a retailer cannot mint, a manufacturer cannot shelve
    expect((await api.post("/api/products").set(as(shopToken)).send(product({ tokenId: "0x2", serial: "S2" }))).status).toBe(403);
    expect((await api.post("/api/events").set(as(makerToken)).send(step("0xabc123", "shipping"))).status).toBe(201);
    expect((await api.post("/api/events").set(as(makerToken)).send(step("0xabc123", "receiving"))).status).toBe(403);
    expect((await api.post("/api/events").set(as(shopToken)).send(step("0xabc123", "receiving"))).status).toBe(201);
  });

  it("does not let non-admins assign roles", async () => {
    const token = (await login(maker)).body.token;
    const res = await api.put(`/api/users/${maker.address}/role`).set("Authorization", `Bearer ${token}`).send({ role: "ADMIN" });
    expect(res.status).toBe(403);
  });

  it("rejects a signature from a different wallet and reused-after-tamper messages", async () => {
    const { message } = (await api.get("/api/auth/challenge")).body;
    const signature = await maker.signMessage(message + " ");
    const res = await api.post("/api/auth/login").send({ message, signature });
    // signature over a different message recovers a different address, so it still logs in as *someone*,
    // but never as an address that did not sign this exact challenge
    expect(res.body.address).not.toBe(maker.address.toLowerCase());

    const forged = await api.post("/api/auth/login").send({ message: message.replace("sign in", "do evil"), signature });
    expect(forged.status).toBe(400);
  });
});

describe("ownership proof", () => {
  let api: ReturnType<typeof request>;
  beforeEach(async () => {
    api = request(createApp(env({ AUTH_REQUIRED: "false" }), new MemoryRepo()));
    await api.post("/api/products").send(product({ manufacturerId: maker.address }));
  });

  const prove = async (wallet: BaseWallet, claim = wallet.address) => {
    const { message } = (await api.post("/api/verify/challenge").send({ tokenId: "0xabc123" })).body;
    const signature = await wallet.signMessage(message);
    return api.post("/api/verify/ownership").send({ tokenId: "0xabc123", owner: claim, message, signature });
  };

  it("confirms the registered owner who signs", async () => {
    const res = await prove(maker);
    expect(res.status).toBe(200);
    expect(res.body.verified).toBe(true);
  });

  it("denies a wallet that is not the owner", async () => {
    const res = await prove(shop);
    expect(res.body.verified).toBe(false);
    expect(res.body.reason).toMatch(/not the registered owner/);
  });

  it("denies someone claiming the owner address without its key", async () => {
    const res = await prove(shop, maker.address);
    expect(res.body.verified).toBe(false);
    expect(res.body.reason).toMatch(/Signature/);
  });

  it("rejects a challenge issued for another product", async () => {
    await api.post("/api/products").send(product({ tokenId: "0xdef456", serial: "SN-2" }));
    const { message } = (await api.post("/api/verify/challenge").send({ tokenId: "0xdef456" })).body;
    const signature = await maker.signMessage(message);
    const res = await api.post("/api/verify/ownership").send({ tokenId: "0xabc123", owner: maker.address, message, signature });
    expect(res.status).toBe(400);
  });
});

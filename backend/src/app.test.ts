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

  it("derives the token id from gtin and serial when none is given", async () => {
    const { tokenId, ...rest } = product();
    void tokenId;
    const res = await api.post("/api/products").send(rest);
    expect(res.status).toBe(201);
    expect(res.body.tokenId).toMatch(/^0x[0-9a-f]+$/);
    expect((await api.get("/api/metadata/" + res.body.tokenId)).status).toBe(200);
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
  let app: ReturnType<typeof createApp>;
  const CSRF = { "X-Requested-With": "authentick" };

  /** A browser-like session: the login cookie is kept and replayed. */
  const login = async (wallet: BaseWallet) => {
    const session = request.agent(app);
    const { message } = (await session.get("/api/auth/challenge")).body;
    const signature = await wallet.signMessage(message);
    const res = await session.post("/api/auth/login").set(CSRF).send({ message, signature });
    return { session, res, message, signature };
  };

  beforeEach(() => {
    app = createApp(env({ AUTH_REQUIRED: "true" }), new MemoryRepo());
  });

  it("blocks writes when signed out", async () => {
    expect((await request(app).post("/api/products").send(product())).status).toBe(401);
  });

  it("keeps the session in an httpOnly cookie and never in the response body", async () => {
    const { res } = await login(maker);
    expect(res.body).toEqual({ address: maker.address.toLowerCase(), role: "CUSTOMER" });
    const cookie = String(res.headers["set-cookie"]);
    expect(cookie).toMatch(/authentick_session=/);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Lax/);
  });

  it("gives a plain wallet the customer role and blocks minting", async () => {
    const { session, res } = await login(maker);
    expect(res.body.role).toBe("CUSTOMER");
    expect((await session.post("/api/products").set(CSRF).send(product())).status).toBe(403);
  });

  it("lets an admin grant roles, then each role does only its own job", async () => {
    const { session: boss, res } = await login(admin);
    expect(res.body.role).toBe("ADMIN");

    for (const [wallet, role] of [[maker, "MANUFACTURER"], [shop, "RETAILER"]] as const) {
      const r = await boss.put(`/api/users/${wallet.address}/role`).set(CSRF).send({ role });
      expect(r.status).toBe(200);
    }

    const { session: makerS } = await login(maker);
    const { session: shopS } = await login(shop);

    const mint = await makerS.post("/api/products").set(CSRF).send(product({ manufacturerId: "spoofed" }));
    expect(mint.status).toBe(201);
    // recorded under the signed-in wallet, not whatever the client claimed
    expect(mint.body.manufacturerId).toBe(maker.address.toLowerCase());

    // a retailer cannot mint, a manufacturer cannot shelve
    expect((await shopS.post("/api/products").set(CSRF).send(product({ tokenId: "0x2", serial: "S2" }))).status).toBe(403);
    expect((await makerS.post("/api/events").set(CSRF).send(step("0xabc123", "shipping"))).status).toBe(201);
    expect((await makerS.post("/api/events").set(CSRF).send(step("0xabc123", "receiving"))).status).toBe(403);
    expect((await shopS.post("/api/events").set(CSRF).send(step("0xabc123", "receiving"))).status).toBe(201);
  });

  it("refuses cookie-authenticated writes that lack the anti-CSRF header", async () => {
    const { session: boss } = await login(admin);
    await boss.put(`/api/users/${maker.address}/role`).set(CSRF).send({ role: "MANUFACTURER" });
    const { session } = await login(maker);
    // exactly what a cross-site form post would look like: cookie attached, no custom header
    expect((await session.post("/api/products").send(product())).status).toBe(401);
    expect((await session.post("/api/products").set(CSRF).send(product())).status).toBe(201);
  });

  it("ends the session on logout", async () => {
    const { session } = await login(maker);
    expect((await session.get("/api/auth/me")).status).toBe(200);
    expect((await session.post("/api/auth/logout").set(CSRF)).status).toBe(204);
    expect((await session.get("/api/auth/me")).status).toBe(401);
  });

  it("does not let non-admins assign roles", async () => {
    const { session } = await login(maker);
    const res = await session.put(`/api/users/${maker.address}/role`).set(CSRF).send({ role: "ADMIN" });
    expect(res.status).toBe(403);
  });

  it("accepts a challenge only once, so a captured signature cannot be replayed", async () => {
    const { message, signature } = await login(maker);
    const replay = await request(app).post("/api/auth/login").send({ message, signature });
    expect(replay.status).toBe(400);
    expect(replay.body.error).toMatch(/already used/);
  });

  it("rejects a signature from a different wallet and reused-after-tamper messages", async () => {
    const { message } = (await request(app).get("/api/auth/challenge")).body;
    const signature = await maker.signMessage(message + " ");
    const res = await request(app).post("/api/auth/login").send({ message, signature });
    // signature over a different message recovers a different address, so it still logs in as *someone*,
    // but never as an address that did not sign this exact challenge
    expect(res.body.address).not.toBe(maker.address.toLowerCase());

    const forged = await request(app).post("/api/auth/login").send({ message: message.replace("sign in", "do evil"), signature });
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

  it("accepts an ownership challenge only once", async () => {
    const { message } = (await api.post("/api/verify/challenge").send({ tokenId: "0xabc123" })).body;
    const signature = await maker.signMessage(message);
    const body = { tokenId: "0xabc123", owner: maker.address, message, signature };
    expect((await api.post("/api/verify/ownership").send(body)).body.verified).toBe(true);
    expect((await api.post("/api/verify/ownership").send(body)).status).toBe(400);
  });

  it("rejects a challenge issued for another product", async () => {
    await api.post("/api/products").send(product({ tokenId: "0xdef456", serial: "SN-2" }));
    const { message } = (await api.post("/api/verify/challenge").send({ tokenId: "0xdef456" })).body;
    const signature = await maker.signMessage(message);
    const res = await api.post("/api/verify/ownership").send({ tokenId: "0xabc123", owner: maker.address, message, signature });
    expect(res.status).toBe(400);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_TOKEN, isDemoToken, isValidGtin14, mockRequest, resetDemoToken, resetMock } from "./mockApi";

// the mock waits a few hundred ms to feel real; tests do not need that
vi.stubGlobal("setTimeout", ((fn: () => void) => {
  fn();
  return 0;
}) as unknown as typeof setTimeout);

const get = (id: string) => mockRequest<{ product: any; events: any[] }>("GET", `/api/metadata/${id}`);
const ev = (tokenId: string, key: string) =>
  mockRequest("POST", "/api/events", { tokenId, bizStep: `urn:epcglobal:cbv:bizstep:${key}`, readPoint: "gln:1", actor: "a" });
const mint = (over: Record<string, unknown> = {}) =>
  mockRequest("POST", "/api/products", {
    tokenId: "0xabc",
    name: "Watch",
    gtin: "04012345678901",
    serial: "SN-1",
    batchId: "B1",
    manufacturerId: "maker",
    ...over,
  });

beforeEach(() => {
  localStorage.clear();
  resetMock();
});

describe("gtin", () => {
  it("checks the GS1 check digit", () => {
    expect(isValidGtin14("04012345678901")).toBe(true);
    expect(isValidGtin14("04012345678902")).toBe(false);
    expect(isValidGtin14("123")).toBe(false);
  });
});

describe("demo token", () => {
  it("is recognised however it is typed", () => {
    expect(isDemoToken(DEMO_TOKEN)).toBe(true);
    expect(isDemoToken(`  ${DEMO_TOKEN.toUpperCase().replace("0X", "0x")} `)).toBe(true);
    expect(isDemoToken("0x123")).toBe(false);
  });

  it("starts as a freshly minted item and walks the whole journey", async () => {
    let rec = await get(DEMO_TOKEN);
    expect(rec.product.status).toBe("PRODUCTION");
    expect(rec.events).toHaveLength(1);

    for (const step of ["shipping", "receiving", "storing", "selling"]) await ev(DEMO_TOKEN, step);

    rec = await get(DEMO_TOKEN);
    expect(rec.product.status).toBe("SOLD");
    expect(rec.events.map((e) => e.bizStep.split(":").pop())).toEqual([
      "commissioning",
      "shipping",
      "receiving",
      "storing",
      "selling",
    ]);

    resetDemoToken();
    expect((await get(DEMO_TOKEN)).events).toHaveLength(1);
  });
});

describe("token ids", () => {
  it("are derived from gtin + serial when the form leaves them blank", async () => {
    const a = (await mint({ tokenId: undefined, serial: "S-1" })) as { tokenId: string };
    expect(a.tokenId).toMatch(/^0x[0-9a-f]{16}$/);
    expect((await get(a.tokenId)).product.serial).toBe("S-1");
    await expect(mint({ tokenId: undefined, serial: "S-1" })).rejects.toThrow(/already exists/);
    expect(((await mint({ tokenId: undefined, serial: "S-2" })) as { tokenId: string }).tokenId).not.toBe(a.tokenId);
  });
});

describe("rules match the real API", () => {
  it("rejects steps out of order and after a sale", async () => {
    await mint();
    await expect(ev("0xabc", "storing")).rejects.toThrow(/Next allowed: shipping/);
    for (const s of ["shipping", "receiving", "storing", "selling"]) await ev("0xabc", s);
    await expect(ev("0xabc", "shipping")).rejects.toThrow(/already sold/);
  });

  it("refuses duplicates and bad GTIN check digits", async () => {
    await mint();
    await expect(mint({ name: "Fake" })).rejects.toThrow(/already exists/);
    await expect(mint({ tokenId: "0xdef" })).rejects.toThrow(/already registered/);
    await expect(mint({ tokenId: "0x999", serial: "S9", gtin: "04012345678902" })).rejects.toThrow(/check digit/);
  });

  it("rejects events for unknown products", async () => {
    await expect(ev("0xnope", "shipping")).rejects.toThrow(/not found/i);
  });
});

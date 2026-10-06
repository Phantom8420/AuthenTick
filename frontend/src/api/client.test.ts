import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiGet, apiPost, setAuthProvider, setToken } from "./client";
import { DEMO_TOKEN, disableDemo, isDemo, resetMock } from "@/lib/mockApi";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  resetMock();
  disableDemo();
});
afterEach(() => {
  vi.unstubAllGlobals();
  setAuthProvider(null);
});

describe("api client", () => {
  it("resolves the demo token locally even when demo mode is off", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    expect(isDemo()).toBe(false);

    const rec = await apiGet<{ product: { tokenId: string } }>(`/api/metadata/${DEMO_TOKEN}`);
    expect(rec.product.tokenId).toBe(DEMO_TOKEN);
    expect(isDemo()).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("falls back to demo mode when the host answers with HTML", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html></html>", { headers: { "Content-Type": "text/html" } })));
    const rec = await apiGet<{ product: unknown }>(`/api/metadata/${DEMO_TOKEN.toUpperCase().replace("0X", "0x")}`);
    expect(rec.product).toBeTruthy();
    expect(isDemo()).toBe(true);
  });

  it("signs in once on a 401, then replays the request with the token", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(json({ error: "Sign in with your wallet first" }, 401))
      .mockResolvedValueOnce(json({ ok: true }, 201));
    vi.stubGlobal("fetch", fetchSpy);
    setAuthProvider(async () => {
      setToken("jwt-123");
      return true;
    });

    const res = await apiPost<{ ok: boolean }>("/api/products", { tokenId: "0x1" });
    expect(res.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect((fetchSpy.mock.calls[1][1] as RequestInit).headers).toMatchObject({ Authorization: "Bearer jwt-123" });
  });

  it("surfaces the API error message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({ error: "Cannot record storing after commissioning" }, 409)));
    await expect(apiPost("/api/events", {})).rejects.toThrow(/Cannot record storing/);
  });
});

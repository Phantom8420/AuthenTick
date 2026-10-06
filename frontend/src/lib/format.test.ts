import { describe, expect, it } from "vitest";
import { bizKey, bizLabel, short, statusLabel, tokenFromScan } from "./format";

describe("format", () => {
  it("shortens long values only", () => {
    expect(short("0x1234567890abcdef", 6, 4)).toBe("0x1234…cdef");
    expect(short("0x12", 6, 4)).toBe("0x12");
  });

  it("reads business steps from urns and plain names", () => {
    expect(bizKey("urn:epcglobal:cbv:bizstep:Shipping")).toBe("shipping");
    expect(bizLabel("urn:epcglobal:cbv:bizstep:selling")).toBe("Selling");
    expect(bizLabel("commissioning")).toBe("Commissioning");
  });

  it("extracts a token from a scanned product link or raw text", () => {
    expect(tokenFromScan("https://x.app/product/0xabc123?x=1")).toBe("0xabc123");
    expect(tokenFromScan("  0xabc123 ")).toBe("0xabc123");
  });

  it("labels status", () => {
    expect(statusLabel("IN_TRANSIT")).toBe("IN TRANSIT");
    expect(statusLabel()).toBe("PRODUCTION");
  });
});

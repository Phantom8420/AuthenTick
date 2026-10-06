import { describe, expect, it } from "vitest";
import { gtinCheckDigit, isValidGtin14 } from "./gtin.js";
import { canFollow, parseBizStep, statusAfter, toUrn } from "./lifecycle.js";

describe("gtin", () => {
  it("accepts real GS1 numbers", () => {
    expect(isValidGtin14("04012345678901")).toBe(true);
    expect(isValidGtin14("00012345678905")).toBe(true);
  });

  it("rejects a wrong check digit, wrong length and non-digits", () => {
    expect(isValidGtin14("04012345678902")).toBe(false);
    expect(isValidGtin14("0401234567890")).toBe(false);
    expect(isValidGtin14("0401234567890a")).toBe(false);
  });

  it("computes the check digit", () => {
    expect(gtinCheckDigit("0401234567890")).toBe(1);
  });
});

describe("lifecycle", () => {
  it("parses short names and urns, rejects unknowns", () => {
    expect(parseBizStep("shipping")).toBe("shipping");
    expect(parseBizStep(toUrn("storing"))).toBe("storing");
    expect(parseBizStep("teleporting")).toBeNull();
  });

  it("only allows the legal order", () => {
    expect(canFollow("commissioning", "shipping")).toBe(true);
    expect(canFollow("commissioning", "storing")).toBe(false);
    expect(canFollow("receiving", "storing")).toBe(true);
    expect(canFollow("selling", "shipping")).toBe(false);
  });

  it("maps steps to a product status", () => {
    expect(statusAfter("shipping")).toBe("IN_TRANSIT");
    expect(statusAfter("storing")).toBe("RETAIL");
    expect(statusAfter("selling")).toBe("SOLD");
  });
});

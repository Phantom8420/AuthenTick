import { describe, expect, it } from "vitest";
import { issueChallenge, verifyChallenge } from "./challenge.js";

const secret = "test-secret-test-secret";

describe("challenge", () => {
  it("verifies a fresh challenge for the same purpose", () => {
    expect(verifyChallenge(issueChallenge("login", secret), "login", secret)).toBe(true);
  });

  it("rejects another purpose, another secret and tampering", () => {
    const msg = issueChallenge("ownership:0xabc", secret);
    expect(verifyChallenge(msg, "ownership:0xdef", secret)).toBe(false);
    expect(verifyChallenge(msg, "ownership:0xabc", "different-secret-value")).toBe(false);
    expect(verifyChallenge(msg.replace("prove", "steal"), "ownership:0xabc", secret)).toBe(false);
  });

  it("expires after five minutes", () => {
    const now = Date.now();
    const msg = issueChallenge("login", secret, now);
    expect(verifyChallenge(msg, "login", secret, now + 4 * 60_000)).toBe(true);
    expect(verifyChallenge(msg, "login", secret, now + 6 * 60_000)).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { ScanLog, WINDOW_MS, assessRisk, sourceOf, type Scan } from "./risk.js";

const NOW = 1_700_000_000_000;
const spread = (n: number, gapMs = 120_000): Scan[] => Array.from({ length: n }, (_, i) => ({ t: NOW - i * gapMs, src: `net${i}` }));

describe("assessRisk", () => {
  it("treats a few ordinary scans as low risk", () => {
    const r = assessRisk(spread(3), "IN_TRANSIT", NOW);
    expect(r).toMatchObject({ level: "low", score: 0, reasons: [] });
  });

  it("flags a code scanned from many networks, a cloned label's signature", () => {
    const r = assessRisk(spread(10), "IN_TRANSIT", NOW);
    expect(r.level).toBe("high");
    expect(r.reasons[0]).toMatch(/10 different networks/);
  });

  it("is stricter once the item is sold", () => {
    const unsold = assessRisk(spread(5), "RETAIL", NOW);
    const sold = assessRisk(spread(5), "SOLD", NOW);
    expect(sold.score).toBeGreaterThan(unsold.score);
    expect(sold.level).toBe("medium");
    expect(sold.reasons[0]).toMatch(/already been sold/);
  });

  it("flags scripted probing from a single source", () => {
    const burst: Scan[] = Array.from({ length: 30 }, (_, i) => ({ t: NOW - i * 1000, src: "bot" }));
    const r = assessRisk(burst, "RETAIL", NOW);
    expect(r.level).toBe("high");
    expect(r.sources).toBe(1);
    expect(r.reasons.join(" ")).toMatch(/within one minute/);
  });

  it("ignores scans older than a day", () => {
    const old: Scan[] = Array.from({ length: 20 }, (_, i) => ({ t: NOW - WINDOW_MS - 1000 - i, src: `n${i}` }));
    expect(assessRisk(old, "SOLD", NOW)).toMatchObject({ level: "low", scans: 0 });
  });

  it("scores more spread as riskier, never lower", () => {
    const scores = [2, 5, 8, 12, 20].map((n) => assessRisk(spread(n), "RETAIL", NOW).score);
    expect([...scores].sort((a, b) => a - b)).toEqual(scores);
  });
});

describe("sourceOf", () => {
  it("groups one /24 together, separates others, and never exposes the address", () => {
    const a = sourceOf("203.0.113.5", "secret-secret-secret");
    expect(sourceOf("203.0.113.200", "secret-secret-secret")).toBe(a);
    expect(sourceOf("203.0.114.5", "secret-secret-secret")).not.toBe(a);
    expect(a).not.toContain("203");
    expect(sourceOf("::ffff:203.0.113.9", "secret-secret-secret")).toBe(a);
  });
});

describe("ScanLog", () => {
  it("keeps a bounded rolling window per token", () => {
    const log = new ScanLog(5, 2);
    for (let i = 0; i < 9; i++) log.record("a", `s${i}`, NOW + i);
    expect(log.list("a")).toHaveLength(5);
    log.record("b", "x", NOW);
    log.record("c", "x", NOW);
    expect(log.list("a")).toHaveLength(0); // evicted: only 2 tokens are kept
    log.record("c", "y", NOW + WINDOW_MS + 5);
    expect(log.list("c")).toHaveLength(1); // the day-old scan dropped out
  });
});

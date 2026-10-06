import { describe, expect, it } from "vitest";
import { assessRisk, type Scan } from "./risk";

const NOW = 1_700_000_000_000;
const spread = (n: number): Scan[] => Array.from({ length: n }, (_, i) => ({ t: NOW - i * 120_000, src: `net${i}` }));

// these mirror backend/src/services/risk.test.ts so the demo cannot drift from the API
describe("assessRisk (demo copy)", () => {
  it("scores the same cases the same way as the backend", () => {
    expect(assessRisk(spread(3), "RETAIL", NOW)).toMatchObject({ level: "low", score: 0 });
    expect(assessRisk(spread(10), "RETAIL", NOW).level).toBe("high");
    expect(assessRisk(spread(5), "SOLD", NOW).level).toBe("medium");
    const burst: Scan[] = Array.from({ length: 30 }, (_, i) => ({ t: NOW - i * 1000, src: "bot" }));
    expect(assessRisk(burst, "RETAIL", NOW).level).toBe("high");
  });
});

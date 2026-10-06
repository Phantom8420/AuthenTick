/**
 * Scan anomaly scoring, mirrored from backend/src/services/risk.ts so the demo
 * behaves like the real API. Keep the two in sync (both have tests).
 */

export const WINDOW_MS = 24 * 60 * 60 * 1000;
const BURST_MS = 60 * 1000;

export interface Scan {
  t: number;
  /** Opaque id of the network the scan came from. Never an IP address. */
  src: string;
}

export type RiskLevel = "low" | "medium" | "high";

export interface Risk {
  score: number;
  level: RiskLevel;
  reasons: string[];
  scans: number;
  sources: number;
}

export function assessRisk(scans: Scan[], status: string | undefined, now = Date.now()): Risk {
  const recent = scans.filter((s) => now - s.t <= WINDOW_MS).sort((a, b) => a.t - b.t);
  const sources = new Set(recent.map((s) => s.src)).size;

  // most scans inside any one-minute window
  let burst = 0;
  for (let i = 0, j = 0; i < recent.length; i++) {
    while (recent[i].t - recent[j].t > BURST_MS) j++;
    burst = Math.max(burst, i - j + 1);
  }

  // unsold stock passes through many hands; a sold item is checked by its buyer and few others
  const sold = status === "SOLD";
  const spread = Math.max(0, sources - (sold ? 2 : 4));
  const probing = Math.max(0, burst - 8);

  const score = Math.round(100 * (1 - Math.exp(-(0.28 * spread + 0.12 * probing))));
  const level: RiskLevel = score >= 70 ? "high" : score >= 35 ? "medium" : "low";

  const reasons: string[] = [];
  if (spread > 0) {
    reasons.push(
      `${sources} different networks scanned this code in 24 hours${sold ? ", but it has already been sold" : ""}.`,
    );
  }
  if (probing > 0) reasons.push(`${burst} scans landed within one minute, which looks automated.`);

  return { score, level, reasons, scans: recent.length, sources };
}

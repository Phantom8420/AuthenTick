import { createHmac } from "node:crypto";
import { isIP } from "node:net";

/**
 * Scan anomaly detection. A genuine label is read by a handful of people in a
 * handful of places; a cloned one shows up everywhere at once. Each lookup is
 * logged against the token, then scored from how many distinct networks scanned
 * it in the last day and how bursty the scanning is.
 *
 * This is a transparent statistical model (saturating score over two features),
 * not a trained network: every reason it gives can be traced to a number.
 * Keep it in sync with frontend/src/lib/risk.ts, which powers the demo.
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

/** Coarse network id: the /24 for IPv4 (so one office is one source), the /64 for IPv6, hashed with a secret. */
export function sourceOf(ip: string | undefined, secret: string): string {
  const addr = (ip ?? "unknown").replace(/^::ffff:/, "");
  let net = addr;
  if (isIP(addr) === 4) net = addr.split(".").slice(0, 3).join(".");
  else if (isIP(addr) === 6) net = addr.split(":").slice(0, 4).join(":");
  return createHmac("sha256", secret).update(net).digest("hex").slice(0, 12);
}

/**
 * Rolling per-token scan history, kept in memory (a day of signal does not
 * need to survive a restart). With several API instances, back it with Redis.
 */
export class ScanLog {
  private byToken = new Map<string, Scan[]>();

  constructor(
    private readonly maxPerToken = 500,
    private readonly maxTokens = 10_000,
  ) {}

  record(tokenId: string, src: string, now = Date.now()) {
    const list = (this.byToken.get(tokenId) ?? []).filter((s) => now - s.t <= WINDOW_MS);
    list.push({ t: now, src });
    if (list.length > this.maxPerToken) list.splice(0, list.length - this.maxPerToken);
    this.byToken.delete(tokenId); // re-insert so the oldest tokens are evicted first
    this.byToken.set(tokenId, list);
    if (this.byToken.size > this.maxTokens) this.byToken.delete(this.byToken.keys().next().value as string);
  }

  list(tokenId: string): Scan[] {
    return this.byToken.get(tokenId) ?? [];
  }
}

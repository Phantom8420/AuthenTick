import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Stateless wallet challenges. The server signs a nonce with its secret, so
 * there is nothing to store: a message is valid if the MAC checks out and it
 * is recent. The wallet then signs the whole message with personal_sign.
 */

const MAX_AGE_MS = 5 * 60 * 1000;

const describe = (purpose: string) =>
  purpose === "login" ? "sign in" : `prove ownership of token ${purpose.replace(/^ownership:/, "")}`;

const mac = (secret: string, purpose: string, ts: number, rand: string) =>
  createHmac("sha256", secret).update(`${purpose}|${ts}|${rand}`).digest("hex").slice(0, 32);

const render = (purpose: string, ts: number, rand: string, tag: string) =>
  `AuthenTick wants you to ${describe(purpose)}.\n\nNonce: ${ts}.${rand}.${tag}`;

export function issueChallenge(purpose: string, secret: string, now = Date.now()): string {
  const rand = randomBytes(12).toString("hex");
  return render(purpose, now, rand, mac(secret, purpose, now, rand));
}

export function verifyChallenge(message: string, purpose: string, secret: string, now = Date.now()): boolean {
  const m = /Nonce: (\d+)\.([0-9a-f]+)\.([0-9a-f]{32})$/.exec(message);
  if (!m) return false;
  const ts = Number(m[1]);
  if (!Number.isSafeInteger(ts) || now - ts > MAX_AGE_MS || ts - now > 60_000) return false;

  const expected = render(purpose, ts, m[2], mac(secret, purpose, ts, m[2]));
  const a = Buffer.from(expected);
  const b = Buffer.from(message);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Remembers which challenges have been used so a signed message cannot be
 * replayed inside its validity window. In memory: with several API instances,
 * back this with a shared store (Redis, or a Mongo TTL collection).
 */
export class NonceStore {
  private seen = new Map<string, number>();

  constructor(private readonly ttlMs = 6 * 60 * 1000) {}

  /** True the first time a nonce is presented, false on any reuse. */
  consume(nonce: string, now = Date.now()): boolean {
    for (const [n, exp] of this.seen) {
      if (exp > now) break; // insertion order is expiry order
      this.seen.delete(n);
    }
    if (this.seen.has(nonce)) return false;
    this.seen.set(nonce, now + this.ttlMs);
    return true;
  }
}

/** The part of a challenge message that is unique per issue. */
export const nonceOf = (message: string) => /Nonce: (\S+)$/.exec(message)?.[1] ?? message;

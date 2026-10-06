import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { Contract } from "ethers";
import { z } from "zod";
import type { Env } from "./config/env.js";
import type { Repository } from "./repo/types.js";
import type { Anchor } from "./services/anchor.js";
import type { NonceStore } from "./services/nonces.js";

export interface Deps {
  env: Env;
  repo: Repository;
  nft: Contract | null;
  /** Mirrors writes onto the chain. Null unless a relayer is configured. */
  anchor: Anchor | null;
  /** Registry contract for reading stages. */
  registry: Contract | null;
  nonces: NonceStore;
}

/** Express 4 does not catch rejected promises from async handlers. */
export const wrap =
  (fn: (req: Request, res: Response) => Promise<unknown>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };

const TOKEN = /^(0x[0-9a-fA-F]{1,64}|\d{1,78})$/;

/** Canonical form of a token id, or null when it could not be a real one. */
export const normalizeToken = (raw: unknown): string | null =>
  typeof raw === "string" && TOKEN.test(raw.trim()) ? raw.trim().toLowerCase() : null;

export const tokenId = z
  .string()
  .trim()
  .regex(TOKEN, "Token ID must be hex (0x…) or numeric")
  .transform((s) => s.toLowerCase());

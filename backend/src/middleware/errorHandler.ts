import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../errors.js";
import { ConflictError } from "../repo/types.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const first = err.issues[0];
    const where = first.path.length ? `${first.path.join(".")}: ` : "";
    return res.status(400).json({ error: `${where}${first.message}`, details: err.flatten() });
  }
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if (err instanceof ConflictError) return res.status(409).json({ error: err.message });
  // body-parser errors carry a status; anything else is ours to hide
  const status = (err as { status?: number }).status;
  if (status && status >= 400 && status < 500) {
    return res.status(status).json({ error: (err as Error).message });
  }
  console.error(err);
  return res.status(500).json({ error: "Internal error" });
}

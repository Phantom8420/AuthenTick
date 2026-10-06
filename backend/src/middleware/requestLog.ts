import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

/** One JSON line per request, tagged with an id that is also returned to the caller. */
export const requestLog = (enabled: boolean): RequestHandler => (req, res, next) => {
  const incoming = req.headers["x-request-id"];
  req.id = typeof incoming === "string" && /^[\w-]{1,64}$/.test(incoming) ? incoming : randomUUID();
  res.setHeader("X-Request-Id", req.id);
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    if (!enabled) return;
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    console.log(
      JSON.stringify({
        level: res.statusCode >= 500 ? "error" : "info",
        msg: "request",
        id: req.id,
        method: req.method,
        path: req.originalUrl.split("?")[0],
        status: res.statusCode,
        ms: Math.round(ms * 10) / 10,
        user: req.user?.address,
      }),
    );
  });
  next();
};

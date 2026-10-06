import { Router } from "express";
import type { Deps } from "../http.js";
import { wrap } from "../http.js";

export const healthRouter = ({ env, repo, nft, anchor }: Deps) => {
  const router = Router();

  router.get(
    "/health",
    wrap(async (_req, res) => {
      const dbOk = await repo.ping().catch(() => false);
      res.status(dbOk ? 200 : 503).json({
        status: dbOk ? "ok" : "degraded",
        service: "authentick-api",
        store: env.MONGODB_URI ? "mongodb" : "memory",
        authRequired: env.AUTH_REQUIRED,
        chain: Boolean(nft),
        anchoring: Boolean(anchor),
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
      });
    }),
  );

  return router;
};

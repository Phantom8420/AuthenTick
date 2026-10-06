import { Router } from "express";
import type { Deps } from "../http.js";
import { wrap } from "../http.js";

export const healthRouter = ({ env, repo, nft }: Deps) => {
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
        timestamp: new Date().toISOString(),
      });
    }),
  );

  return router;
};

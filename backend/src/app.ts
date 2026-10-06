import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import type { Env } from "./config/env.js";
import type { Repository } from "./repo/types.js";
import type { Deps } from "./http.js";
import { attachUser } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { healthRouter } from "./routes/health.js";
import { authRouter, usersRouter } from "./routes/auth.js";
import { productsRouter } from "./routes/products.js";
import { eventsRouter } from "./routes/events.js";
import { metadataRouter } from "./routes/metadata.js";
import { verifyRouter } from "./routes/verify.js";
import { requestLog } from "./middleware/requestLog.js";
import { Anchor } from "./services/anchor.js";
import { NonceStore } from "./services/nonces.js";
import type { Chain } from "./config/blockchain.js";

export function createApp(env: Env, repo: Repository, chain: Chain | null = null) {
  const app = express();
  const deps: Deps = {
    env,
    repo,
    nft: chain?.nft ?? null,
    registry: chain?.registry ?? null,
    anchor: chain?.write ? new Anchor(chain.write) : null,
    nonces: new NonceStore(),
  };

  // behind nginx / a platform proxy, so client IPs are real for rate limiting
  if (env.NODE_ENV === "production") app.set("trust proxy", 1);

  app.disable("x-powered-by");
  app.use(requestLog(env.NODE_ENV !== "test"));
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN.split(",").map((s) => s.trim()), credentials: true }));
  app.use(express.json({ limit: "100kb" }));

  const limit = (max: number) =>
    env.NODE_ENV === "test"
      ? (_req: express.Request, _res: express.Response, next: express.NextFunction) => next()
      : rateLimit({ windowMs: 60_000, limit: max, standardHeaders: true, legacyHeaders: false, message: { error: "Too many requests, slow down" } });

  app.use("/api", limit(240), attachUser(env));
  app.use("/api", healthRouter(deps));
  app.use("/api/auth", limit(20), authRouter(deps));
  app.use("/api/users", usersRouter(deps));
  app.use("/api/products", productsRouter(deps));
  app.use("/api/events", eventsRouter(deps));
  app.use("/api/metadata", metadataRouter(deps));
  app.use("/api/verify", limit(30), verifyRouter(deps));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

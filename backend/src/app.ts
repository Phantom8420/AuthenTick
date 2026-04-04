import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import type { Env } from "./config/env.js";
import { createBlockchainClients } from "./config/blockchain.js";
import { healthRouter } from "./routes/health.js";
import { productsRouter } from "./routes/products.js";
import { eventsRouter } from "./routes/events.js";
import { metadataRouter } from "./routes/metadata.js";
import { verifyRouter } from "./routes/verify.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

export function createApp(env: Env) {
  const app = express();
  const { nft } = createBlockchainClients(env);

  if (nft) {
    console.log(`NFT contract read client: ${String(nft.target)}`);
  } else {
    console.log("NFT contract disabled (set RPC_URL + NFT_CONTRACT_ADDRESS for on-chain reads)");
  }

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(",").map((s) => s.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  // API Routes
  app.use("/api", healthRouter);
  app.use("/api/products", productsRouter());
  app.use("/api/events", eventsRouter);
  app.use("/api/metadata", metadataRouter);
  app.use("/api/verify", verifyRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
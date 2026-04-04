// backend/src/routes/health.ts
import { Router } from "express";

export const healthRouter = Router();

// Health check endpoint
healthRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "authenTick-api",
    timestamp: new Date().toISOString(),
  });
});
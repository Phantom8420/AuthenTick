import { Router } from "express";
export const healthRouter = Router();
healthRouter.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "authentick-api", timestamp: new Date().toISOString() });
});
//# sourceMappingURL=health.js.map
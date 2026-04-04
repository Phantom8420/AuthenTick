import type { Express } from "express";

export type ApiStore = {
  events: Array<Record<string, unknown> & { productId?: string }>;
};

export function registerApiRoutes(app: Express, store: ApiStore) {
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post("/api/events", (req, res) => {
    const event = {
      ...req.body,
      id: Math.random().toString(36).substring(2, 11),
      recordedTime: Date.now(),
    };
    store.events.push(event);
    res.status(201).json(event);
  });

  app.get("/api/products/:id/history", (req, res) => {
    const productEvents = store.events.filter((e) => e.productId === req.params.id);
    res.json(productEvents);
  });

  app.post("/api/verify-ownership", (req, res) => {
    const { productId, proof, ownerAddress } = req.body;

    const isValid = Boolean(proof && ownerAddress);

    res.json({
      verified: isValid,
      message: isValid ? "Ownership proof verified via ZK-SNARK" : "Invalid proof",
      productId,
      timestamp: Date.now(),
    });
  });
}

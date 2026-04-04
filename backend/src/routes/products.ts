// backend/src/routes/products.ts
import { Router } from "express";
import { z } from "zod";
import { products, events, Product } from "../storage.js";

// Validation schema for incoming product data
const createBody = z.object({
  tokenId: z.string().min(1),
  gtin: z.string().length(14),
  serial: z.string().min(1),
  name: z.string().min(1).max(200),
  manufacturerId: z.string().min(1),
  batchId: z.string().min(1),
  currentOwner: z.string().optional(),
  status: z.enum(["PRODUCTION", "IN_TRANSIT", "RETAIL", "SOLD"]).optional(),
  imageUrl: z.string().max(2048).optional(),
});

export const productsRouter = () => {
  const router = Router();

  // Create a new product
  router.post("/", (req, res) => {
    try {
      const body = createBody.parse(req.body);

      const product: Product = {
        tokenId: body.tokenId,
        gtin: body.gtin,
        serial: body.serial,
        name: body.name,
        batchId: body.batchId,
        manufacturerId: body.manufacturerId,
        currentOwner: body.currentOwner ?? body.manufacturerId,
        status: body.status ?? "PRODUCTION",
      };

      products[body.tokenId] = product;
      events[body.tokenId] = events[body.tokenId] || [];

      // Automatically add a commissioning event
      events[body.tokenId].push({
        bizStep: "commissioning",
        readPoint: "GLN-FACTORY",
        actor: body.manufacturerId,
        eventTime: new Date().toISOString(),
      });

      res.status(201).json(product);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Invalid payload" });
    }
  });

  // Get a product by tokenId
  router.get("/:tokenId", (req, res) => {
    const { tokenId } = req.params;
    const product = products[tokenId];

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      offChain: product,
      events: events[tokenId] || [],
    });
  });

  return router;
};
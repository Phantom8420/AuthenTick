// backend/src/routes/metadata.ts
import { Router } from "express";
import { products, events } from "../storage.js";

export const metadataRouter = Router();

// Fetch product metadata and events by tokenId
metadataRouter.get("/:tokenId", (req, res) => {
  const { tokenId } = req.params;
  const product = products[tokenId];

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json({
    product,
    events: events[tokenId] || [],
  });
});
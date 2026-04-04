// backend/src/routes/verify.ts
import { Router } from "express";
import { products } from "../storage.js";

export const verifyRouter = Router();

// Verify product ownership locally
verifyRouter.post("/ownership", (req, res) => {
  const { tokenId, owner } = req.body;

  if (!tokenId || !owner) {
    return res.status(400).json({ error: "Missing tokenId or owner" });
  }

  const product = products[tokenId];

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const verified = product.currentOwner === owner;

  res.json({ verified, tokenId, owner });
});
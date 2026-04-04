// backend/src/routes/events.ts
import { Router } from "express";
import { events } from "../storage.js";

export const eventsRouter = Router();

// Add an event for a product
eventsRouter.post("/", (req, res) => {
  const { tokenId, bizStep, readPoint, actor } = req.body;

  if (!tokenId || !bizStep || !readPoint) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Initialize events array if it doesn't exist
  if (!events[tokenId]) events[tokenId] = [];

  // Add the new event
  events[tokenId].push({
    bizStep,
    readPoint,
    actor,
    eventTime: new Date().toISOString(),
  });

  res.status(201).json(events[tokenId]);
});

// Get all events for a product
eventsRouter.get("/product/:tokenId", (req, res) => {
  const { tokenId } = req.params;
  const productEvents = events[tokenId] || [];
  res.json(productEvents);
});
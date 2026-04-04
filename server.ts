import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock database for products and events (to be replaced by Firestore)
  const products: any[] = [];
  const events: any[] = [];

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // GS1 EPCIS Event Ingestion
  app.post("/api/events", (req, res) => {
    const event = {
      ...req.body,
      id: Math.random().toString(36).substr(2, 9),
      recordedTime: Date.now(),
    };
    events.push(event);
    res.status(201).json(event);
  });

  // Get Product Provenance
  app.get("/api/products/:id/history", (req, res) => {
    const productEvents = events.filter((e) => e.productId === req.params.id);
    res.json(productEvents);
  });

  // ZK-Proof Verification Simulation
  app.post("/api/verify-ownership", (req, res) => {
    const { productId, proof, ownerAddress } = req.body;
    
    // In a real production system, we would use snarkjs.groth16.verify()
    // Here we simulate the verification logic
    const isValid = proof && ownerAddress; 
    
    res.json({
      verified: isValid,
      message: isValid ? "Ownership proof verified via ZK-SNARK" : "Invalid proof",
      productId,
      timestamp: Date.now()
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AuthenTick Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});

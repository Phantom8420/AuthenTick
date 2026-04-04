import { Router } from "express";
import { ingestEpcisEvent, listEventsForProduct } from "../services/epcisIngestion.js";
export const eventsRouter = Router();
eventsRouter.post("/", async (req, res, next) => {
    try {
        const doc = await ingestEpcisEvent(req.body);
        res.status(201).json(doc);
    }
    catch (e) {
        next(e);
    }
});
eventsRouter.get("/product/:productId", async (req, res, next) => {
    try {
        const rows = await listEventsForProduct(req.params.productId);
        res.json(rows);
    }
    catch (e) {
        next(e);
    }
});
//# sourceMappingURL=events.js.map
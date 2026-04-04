import { Router } from "express";
import { getProductMetadata } from "../services/metadataService.js";
export const metadataRouter = Router();
metadataRouter.get("/:tokenId", async (req, res, next) => {
    try {
        const data = await getProductMetadata(req.params.tokenId);
        if (!data) {
            return res.status(404).json({ error: "Metadata not found" });
        }
        res.json(data);
    }
    catch (e) {
        next(e);
    }
});
//# sourceMappingURL=metadata.js.map
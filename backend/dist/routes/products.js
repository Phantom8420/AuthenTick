import { Router } from "express";
import { z } from "zod";
import { Product } from "../models/Product.js";
import { ingestEpcisEvent } from "../services/epcisIngestion.js";
import { readOnChainProduct } from "../services/blockchainService.js";
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
export function productsRouter(nft) {
    const r = Router();
    r.post("/", async (req, res, next) => {
        try {
            const body = createBody.parse(req.body);
            const product = await Product.create({
                ...body,
                status: body.status ?? "PRODUCTION",
            });
            await ingestEpcisEvent({
                productId: body.tokenId,
                type: "OBJECT_EVENT",
                action: "ADD",
                bizStep: "commissioning",
                disposition: "active",
                readPoint: "GLN-FACTORY",
                eventTime: new Date(),
                actor: body.manufacturerId,
            });
            res.status(201).json(product);
        }
        catch (e) {
            next(e);
        }
    });
    r.get("/:tokenId", async (req, res, next) => {
        try {
            const { tokenId } = req.params;
            const doc = await Product.findOne({ tokenId }).lean().exec();
            const chain = await readOnChainProduct(nft, tokenId);
            if (!doc && !chain) {
                return res.status(404).json({ error: "Product not found" });
            }
            res.json({ offChain: doc, onChain: chain });
        }
        catch (e) {
            next(e);
        }
    });
    return r;
}
//# sourceMappingURL=products.js.map
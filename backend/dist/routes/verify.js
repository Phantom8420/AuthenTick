import { Router } from "express";
import { verifyOwnershipProof } from "../services/zkProverStub.js";
export const verifyRouter = Router();
verifyRouter.post("/ownership", (req, res, next) => {
    try {
        const result = verifyOwnershipProof(req.body);
        res.json(result);
    }
    catch (e) {
        next(e);
    }
});
//# sourceMappingURL=verify.js.map
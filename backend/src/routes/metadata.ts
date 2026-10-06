import { Router } from "express";
import { notFound } from "../errors.js";
import { normalizeToken, wrap, type Deps } from "../http.js";
import { loadRecord } from "../services/records.js";

export const metadataRouter = (deps: Deps) => {
  const router = Router();

  router.get(
    "/:tokenId",
    wrap(async (req, res) => {
      const id = normalizeToken(req.params.tokenId);
      const record = id && (await loadRecord(deps, id));
      if (!record) throw notFound("Product not found");
      res.json(record);
    }),
  );

  return router;
};

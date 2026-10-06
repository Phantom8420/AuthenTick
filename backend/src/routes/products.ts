import { Router } from "express";
import { z } from "zod";
import { requireRole } from "../middleware/auth.js";
import { isValidGtin14 } from "../domain/gtin.js";
import { toUrn } from "../domain/lifecycle.js";
import { badRequest, notFound } from "../errors.js";
import { normalizeToken, tokenId, wrap, type Deps } from "../http.js";
import { deriveTokenId } from "../services/anchor.js";
import { loadRecord } from "../services/records.js";

const createBody = z.object({
  /** Optional: derived from GTIN + serial (same as the contract) when omitted. */
  tokenId: tokenId.optional(),
  name: z.string().trim().min(1).max(200),
  gtin: z.string().refine(isValidGtin14, "GTIN must be 14 digits with a valid GS1 check digit"),
  serial: z.string().trim().min(1).max(100),
  batchId: z.string().trim().min(1).max(100),
  manufacturerId: z.string().trim().min(1).max(200).optional(),
});

export const productsRouter = (deps: Deps) => {
  const { env, repo, anchor } = deps;
  const router = Router();

  router.post(
    "/",
    requireRole(env, "MANUFACTURER"),
    wrap(async (req, res) => {
      const body = createBody.parse(req.body);
      // a signed-in manufacturer is always recorded under their own wallet
      const manufacturerId = req.user?.address ?? body.manufacturerId ?? "unknown-manufacturer";

      const id = body.tokenId ?? deriveTokenId(body.gtin, body.serial);
      if (anchor && BigInt(id) !== BigInt(deriveTokenId(body.gtin, body.serial))) {
        throw badRequest("With on-chain anchoring the token id must be derived from GTIN + serial. Omit tokenId to have it computed.");
      }
      // the chain is the authority on uniqueness, so mint there first
      await anchor?.mint(manufacturerId, body.gtin, body.serial, body.batchId);

      const product = await repo.createProduct(
        {
          tokenId: id,
          name: body.name,
          gtin: body.gtin,
          serial: body.serial,
          batchId: body.batchId,
          manufacturerId,
          currentOwner: manufacturerId,
        },
        {
          bizStep: toUrn("commissioning"),
          readPoint: "GLN-FACTORY",
          actor: manufacturerId,
          eventTime: new Date().toISOString(),
        },
      );
      res.status(201).json(product);
    }),
  );

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

import { Router } from "express";
import { z } from "zod";
import { assertRole } from "../middleware/auth.js";
import {
  ROLES_FOR_STEP,
  allowedAfter,
  canFollow,
  parseBizStep,
  statusAfter,
  toUrn,
} from "../domain/lifecycle.js";
import { badRequest, conflict, notFound } from "../errors.js";
import { normalizeToken, tokenId, wrap, type Deps } from "../http.js";

const eventBody = z.object({
  tokenId,
  bizStep: z.string().min(1),
  readPoint: z.string().trim().min(1).max(200),
  actor: z.string().trim().max(200).optional(),
});

export const eventsRouter = ({ env, repo }: Deps) => {
  const router = Router();

  router.post(
    "/",
    wrap(async (req, res) => {
      const body = eventBody.parse(req.body);

      const step = parseBizStep(body.bizStep);
      if (!step) throw badRequest(`Unknown business step "${body.bizStep}"`);
      if (step === "commissioning") throw badRequest("Commissioning is recorded automatically when a product is minted");
      assertRole(env, req.user, ROLES_FOR_STEP[step]);

      const product = await repo.getProduct(body.tokenId);
      if (!product) throw notFound("Product not found");

      if (!canFollow(product.lastStep, step)) {
        const allowed = allowedAfter(product.lastStep);
        throw conflict(
          allowed.length
            ? `Cannot record "${step}" after "${product.lastStep}". Next allowed: ${allowed.join(", ")}.`
            : `This product is already ${product.lastStep === "selling" ? "sold" : "final"}; no further events are allowed.`,
        );
      }

      const updated = await repo.advance(body.tokenId, product.lastStep, step, statusAfter(step), {
        bizStep: toUrn(step),
        readPoint: body.readPoint,
        actor: req.user?.address ?? body.actor,
        eventTime: new Date().toISOString(),
      });
      // someone recorded an event between our read and write
      if (!updated) throw conflict("The product changed while recording. Reload it and try again.");

      res.status(201).json(await repo.listEvents(body.tokenId));
    }),
  );

  router.get(
    "/product/:tokenId",
    wrap(async (req, res) => {
      const id = normalizeToken(req.params.tokenId);
      if (!id || !(await repo.getProduct(id))) throw notFound("Product not found");
      res.json(await repo.listEvents(id));
    }),
  );

  return router;
};

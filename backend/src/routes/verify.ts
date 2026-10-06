import { Router } from "express";
import { verifyMessage } from "ethers";
import { z } from "zod";
import { badRequest, notFound } from "../errors.js";
import { normalizeToken, tokenId, wrap, type Deps } from "../http.js";
import { issueChallenge, verifyChallenge } from "../services/challenge.js";
import { readOnChainProduct } from "../services/blockchainService.js";

const purpose = (id: string) => `ownership:${id}`;

const proofBody = z.object({
  tokenId,
  owner: z.string().trim().min(1),
  message: z.string().min(1).max(500),
  signature: z.string().min(1).max(200),
});

export const verifyRouter = ({ env, repo, nft }: Deps) => {
  const router = Router();

  // step 1: the wallet asks what to sign
  router.post(
    "/challenge",
    wrap(async (req, res) => {
      const id = normalizeToken(req.body?.tokenId);
      if (!id || !(await repo.getProduct(id))) throw notFound("Product not found");
      res.json({ message: issueChallenge(purpose(id), env.JWT_SECRET) });
    }),
  );

  // step 2: the signature proves the caller controls `owner`; the record says whether `owner` owns it
  router.post(
    "/ownership",
    wrap(async (req, res) => {
      const body = proofBody.parse(req.body);

      const product = await repo.getProduct(body.tokenId);
      if (!product) throw notFound("Product not found");

      if (!verifyChallenge(body.message, purpose(body.tokenId), env.JWT_SECRET)) {
        throw badRequest("This challenge is invalid or has expired. Request a new one.");
      }

      let signer: string;
      try {
        signer = verifyMessage(body.message, body.signature);
      } catch {
        throw badRequest("Malformed signature");
      }

      const claimed = body.owner.toLowerCase();
      if (signer.toLowerCase() !== claimed) {
        return res.json({ verified: false, tokenId: body.tokenId, owner: body.owner, reason: "Signature does not match the wallet" });
      }

      // the chain is the source of truth when configured
      const onChain = await readOnChainProduct(nft, body.tokenId);
      const registeredOwner = (onChain?.owner ?? product.currentOwner).toLowerCase();
      const verified = registeredOwner === claimed;

      res.json({
        verified,
        tokenId: body.tokenId,
        owner: body.owner,
        ...(verified ? {} : { reason: "This wallet is not the registered owner" }),
      });
    }),
  );

  return router;
};

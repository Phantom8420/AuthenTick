import { Router } from "express";
import { getAddress, isAddress, verifyMessage } from "ethers";
import { z } from "zod";
import { requireRole, signToken } from "../middleware/auth.js";
import { badRequest, unauthorized } from "../errors.js";
import { wrap, type Deps } from "../http.js";
import { issueChallenge, verifyChallenge } from "../services/challenge.js";

const loginBody = z.object({
  message: z.string().min(1).max(500),
  signature: z.string().min(1).max(200),
});

const roleBody = z.object({
  role: z.enum(["MANUFACTURER", "DISTRIBUTOR", "RETAILER", "CUSTOMER", "ADMIN"]),
});

export const authRouter = ({ env, repo }: Deps) => {
  const router = Router();

  router.get("/challenge", (_req, res) => {
    res.json({ message: issueChallenge("login", env.JWT_SECRET) });
  });

  router.post(
    "/login",
    wrap(async (req, res) => {
      const { message, signature } = loginBody.parse(req.body);
      if (!verifyChallenge(message, "login", env.JWT_SECRET)) {
        throw badRequest("This challenge is invalid or has expired. Request a new one.");
      }
      let address: string;
      try {
        address = verifyMessage(message, signature).toLowerCase();
      } catch {
        throw badRequest("Malformed signature");
      }

      const role = env.ADMIN_ADDRESSES.includes(address) ? "ADMIN" : ((await repo.getUser(address))?.role ?? "CUSTOMER");
      res.json({ token: signToken(env, { address, role }), address, role });
    }),
  );

  router.get("/me", (req, res) => {
    if (!req.user) throw unauthorized();
    res.json(req.user);
  });

  return router;
};

/** Admin-only role assignment, mounted at /api/users. */
export const usersRouter = ({ env, repo }: Deps) => {
  const router = Router();

  router.put(
    "/:address/role",
    requireRole(env, "ADMIN"),
    wrap(async (req, res) => {
      if (!isAddress(req.params.address)) throw badRequest("Not a valid wallet address");
      const { role } = roleBody.parse(req.body);
      // with auth off (local dev) nobody is signed in, so this stays closed
      if (!env.AUTH_REQUIRED) throw badRequest("Role management needs AUTH_REQUIRED=true");
      res.json(await repo.setUserRole(getAddress(req.params.address).toLowerCase(), role));
    }),
  );

  return router;
};

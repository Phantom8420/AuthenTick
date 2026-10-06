import type { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import type { Env } from "../config/env.js";
import type { Role } from "../domain/lifecycle.js";
import { forbidden, unauthorized } from "../errors.js";

export interface AuthUser {
  address: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const TOKEN_TTL = "12h";

export const signToken = (env: Env, user: AuthUser) =>
  jwt.sign({ role: user.role }, env.JWT_SECRET, { subject: user.address, expiresIn: TOKEN_TTL, algorithm: "HS256" });

/** Reads a bearer token if present. Never rejects: routes decide what they require. */
export const attachUser =
  (env: Env): RequestHandler =>
  (req, _res, next) => {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      try {
        const claims = jwt.verify(header.slice(7), env.JWT_SECRET, { algorithms: ["HS256"] }) as jwt.JwtPayload;
        if (claims.sub && claims.role) req.user = { address: claims.sub, role: claims.role as Role };
      } catch {
        /* expired or tampered: treated as signed out */
      }
    }
    next();
  };

/** Throws unless auth is off, or the user holds one of the roles (admins always pass). */
export function assertRole(env: Env, user: AuthUser | undefined, roles: readonly Role[]) {
  if (!env.AUTH_REQUIRED) return;
  if (!user) throw unauthorized();
  if (user.role !== "ADMIN" && !roles.includes(user.role)) {
    throw forbidden(`This action needs one of these roles: ${roles.join(", ")}. You are ${user.role}.`);
  }
}

export const requireRole =
  (env: Env, ...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      assertRole(env, req.user, roles);
      next();
    } catch (e) {
      next(e);
    }
  };

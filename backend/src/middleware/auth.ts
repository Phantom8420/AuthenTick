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

export const SESSION_COOKIE = "authentick_session";
/** Cookie sessions must send this header on writes. Browsers will not add it cross-site without a CORS preflight. */
export const CSRF_HEADER = "x-requested-with";
export const CSRF_VALUE = "authentick";
export const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;

const readCookie = (header: string | undefined, name: string) => {
  for (const part of (header ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return undefined;
};

export const sessionCookieOptions = (env: Env) => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.COOKIE_SAMESITE,
  maxAge: SESSION_MAX_AGE_MS,
  path: "/",
});

export const signToken = (env: Env, user: AuthUser) =>
  jwt.sign({ role: user.role }, env.JWT_SECRET, { subject: user.address, expiresIn: TOKEN_TTL, algorithm: "HS256" });

/**
 * Reads the session from the httpOnly cookie (browsers) or a bearer header
 * (scripts). Never rejects: routes decide what they require.
 */
export const attachUser =
  (env: Env): RequestHandler =>
  (req, _res, next) => {
    const header = req.headers.authorization;
    const bearer = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    const cookie = bearer ? undefined : readCookie(req.headers.cookie, SESSION_COOKIE);
    const unsafe = !["GET", "HEAD", "OPTIONS"].includes(req.method);
    // a cookie rides along on cross-site requests, so writes must prove they came from our own client
    const csrfOk = !cookie || !unsafe || req.headers[CSRF_HEADER] === CSRF_VALUE;
    const token = bearer ?? (csrfOk ? cookie : undefined);
    if (token) {
      try {
        const claims = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] }) as jwt.JwtPayload;
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

import { randomBytes } from "node:crypto";
import { z } from "zod";

const bool = z
  .enum(["true", "false", "1", "0"])
  .transform((v) => v === "true" || v === "1");

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  /** Leave unset to run on the in-memory store (data is lost on restart). */
  MONGODB_URI: z.string().optional(),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  RPC_URL: z.string().optional(),
  NFT_CONTRACT_ADDRESS: z.string().optional(),
  /** Require a wallet-signed JWT for writes. Defaults to on in production. */
  AUTH_REQUIRED: bool.optional(),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters").optional(),
  /** Comma separated wallet addresses that always get the ADMIN role. */
  ADMIN_ADDRESSES: z.string().default(""),
  /** Use "none" only when the web app and API live on different sites (needs HTTPS). */
  COOKIE_SAMESITE: z.enum(["lax", "strict", "none"]).default("lax"),
  /** OwnershipRegistry address. With RELAYER_PRIVATE_KEY this turns on on-chain anchoring. */
  REGISTRY_CONTRACT_ADDRESS: z.string().optional(),
  /** Wallet that holds the manufacturer, distributor and retailer roles and pays gas. */
  RELAYER_PRIVATE_KEY: z.string().optional(),
});

export type Env = {
  NODE_ENV: "development" | "test" | "production";
  PORT: number;
  MONGODB_URI?: string;
  CORS_ORIGIN: string;
  RPC_URL?: string;
  NFT_CONTRACT_ADDRESS?: string;
  AUTH_REQUIRED: boolean;
  JWT_SECRET: string;
  ADMIN_ADDRESSES: string[];
  COOKIE_SAMESITE: "lax" | "strict" | "none";
  REGISTRY_CONTRACT_ADDRESS?: string;
  RELAYER_PRIVATE_KEY?: string;
};

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const raw = schema.parse(source);
  const authRequired = raw.AUTH_REQUIRED ?? raw.NODE_ENV === "production";

  if (authRequired && !raw.JWT_SECRET && raw.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required when AUTH_REQUIRED is on in production");
  }

  return {
    NODE_ENV: raw.NODE_ENV,
    PORT: raw.PORT,
    MONGODB_URI: raw.MONGODB_URI || undefined,
    CORS_ORIGIN: raw.CORS_ORIGIN,
    RPC_URL: raw.RPC_URL || undefined,
    NFT_CONTRACT_ADDRESS: raw.NFT_CONTRACT_ADDRESS || undefined,
    AUTH_REQUIRED: authRequired,
    // outside production a throwaway secret is fine: tokens just die with the process
    JWT_SECRET: raw.JWT_SECRET ?? randomBytes(32).toString("hex"),
    ADMIN_ADDRESSES: raw.ADMIN_ADDRESSES.split(",")
      .map((a) => a.trim().toLowerCase())
      .filter(Boolean),
    COOKIE_SAMESITE: raw.COOKIE_SAMESITE,
    REGISTRY_CONTRACT_ADDRESS: raw.REGISTRY_CONTRACT_ADDRESS || undefined,
    RELAYER_PRIVATE_KEY: raw.RELAYER_PRIVATE_KEY || undefined,
  };
}

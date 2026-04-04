import { z } from "zod";
import "dotenv/config";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/authentick"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  RPC_URL: z.string().optional(),
  NFT_CONTRACT_ADDRESS: z.string().optional(),
  REGISTRAR_PRIVATE_KEY: z.string().optional(),
});

export type Env = z.infer<typeof schema>;

export const env: Env = schema.parse(process.env);

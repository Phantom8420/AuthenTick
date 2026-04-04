import { z } from "zod";
import "dotenv/config";
declare const schema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "test", "production"]>>;
    PORT: z.ZodDefault<z.ZodNumber>;
    MONGODB_URI: z.ZodDefault<z.ZodString>;
    CORS_ORIGIN: z.ZodDefault<z.ZodString>;
    RPC_URL: z.ZodOptional<z.ZodString>;
    NFT_CONTRACT_ADDRESS: z.ZodOptional<z.ZodString>;
    REGISTRAR_PRIVATE_KEY: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "test" | "production";
    PORT: number;
    MONGODB_URI: string;
    CORS_ORIGIN: string;
    RPC_URL?: string | undefined;
    NFT_CONTRACT_ADDRESS?: string | undefined;
    REGISTRAR_PRIVATE_KEY?: string | undefined;
}, {
    NODE_ENV?: "development" | "test" | "production" | undefined;
    PORT?: number | undefined;
    MONGODB_URI?: string | undefined;
    CORS_ORIGIN?: string | undefined;
    RPC_URL?: string | undefined;
    NFT_CONTRACT_ADDRESS?: string | undefined;
    REGISTRAR_PRIVATE_KEY?: string | undefined;
}>;
export type Env = z.infer<typeof schema>;
export declare const env: Env;
export {};

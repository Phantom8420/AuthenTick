import { JsonRpcProvider, Contract } from "ethers";
import type { Env } from "./env.js";
export declare function createBlockchainClients(env: Env): {
    provider: null;
    nft: Contract | null;
} | {
    provider: JsonRpcProvider;
    nft: Contract;
};

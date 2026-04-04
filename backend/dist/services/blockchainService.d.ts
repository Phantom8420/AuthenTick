import type { Contract } from "ethers";
type OnChainProduct = {
    gtin: string;
    serial: string;
    batchId: string;
    createdAt: number;
    isVerified: boolean;
    owner: string;
};
export declare function readOnChainProduct(nft: Contract | null, tokenId: string): Promise<OnChainProduct | null>;
export {};

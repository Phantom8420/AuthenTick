import mongoose from "mongoose";
export type ProductStatus = "PRODUCTION" | "IN_TRANSIT" | "RETAIL" | "SOLD";
export interface ProductDoc {
    tokenId: string;
    gtin: string;
    serial: string;
    name: string;
    manufacturerId: string;
    batchId: string;
    currentOwner?: string;
    status: ProductStatus;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Product: mongoose.Model<any, {}, {}, {}, any, any>;

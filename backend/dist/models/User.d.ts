import mongoose from "mongoose";
export type UserRole = "MANUFACTURER" | "DISTRIBUTOR" | "RETAILER" | "CUSTOMER" | "ADMIN";
export interface UserDoc {
    walletAddress: string;
    email?: string;
    role: UserRole;
    organizationName?: string;
    gln?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: mongoose.Model<any, {}, {}, {}, any, any>;

import mongoose, { Schema } from "mongoose";

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

const userSchema = new Schema<UserDoc>(
  {
    walletAddress: { type: String, required: true, unique: true, index: true },
    email: { type: String },
    role: {
      type: String,
      enum: ["MANUFACTURER", "DISTRIBUTOR", "RETAILER", "CUSTOMER", "ADMIN"],
      default: "CUSTOMER",
    },
    organizationName: { type: String },
    gln: { type: String },
  },
  { timestamps: true },
);

export const User = mongoose.models.User ?? mongoose.model<UserDoc>("User", userSchema);

import mongoose, { Schema } from "mongoose";
import type { Role } from "../domain/lifecycle.js";

export interface UserDoc {
  address: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    address: { type: String, required: true, unique: true, lowercase: true },
    role: {
      type: String,
      enum: ["MANUFACTURER", "DISTRIBUTOR", "RETAILER", "CUSTOMER", "ADMIN"],
      default: "CUSTOMER",
    },
  },
  { timestamps: true },
);

export const UserModel =
  (mongoose.models.User as mongoose.Model<UserDoc>) ?? mongoose.model<UserDoc>("User", userSchema);

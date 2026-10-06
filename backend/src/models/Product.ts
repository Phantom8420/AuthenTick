import mongoose, { Schema } from "mongoose";
import { BIZ_STEPS, type BizStep, type ProductStatus } from "../domain/lifecycle.js";

export interface ProductDoc {
  tokenId: string;
  gtin: string;
  serial: string;
  name: string;
  manufacturerId: string;
  batchId: string;
  currentOwner: string;
  status: ProductStatus;
  lastStep: BizStep;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<ProductDoc>(
  {
    tokenId: { type: String, required: true, unique: true },
    gtin: { type: String, required: true },
    serial: { type: String, required: true },
    name: { type: String, required: true },
    manufacturerId: { type: String, required: true, index: true },
    batchId: { type: String, required: true },
    currentOwner: { type: String, required: true },
    status: {
      type: String,
      enum: ["PRODUCTION", "IN_TRANSIT", "RETAIL", "SOLD"],
      default: "PRODUCTION",
    },
    lastStep: { type: String, enum: BIZ_STEPS, default: "commissioning" },
  },
  { timestamps: true },
);

productSchema.index({ gtin: 1, serial: 1 }, { unique: true });

export const ProductModel =
  (mongoose.models.Product as mongoose.Model<ProductDoc>) ?? mongoose.model<ProductDoc>("Product", productSchema);

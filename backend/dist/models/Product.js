import mongoose, { Schema } from "mongoose";
const productSchema = new Schema({
    tokenId: { type: String, required: true, unique: true, index: true },
    gtin: { type: String, required: true, index: true },
    serial: { type: String, required: true },
    name: { type: String, required: true },
    manufacturerId: { type: String, required: true, index: true },
    batchId: { type: String, required: true },
    currentOwner: { type: String },
    status: {
        type: String,
        enum: ["PRODUCTION", "IN_TRANSIT", "RETAIL", "SOLD"],
        default: "PRODUCTION",
    },
    imageUrl: { type: String },
}, { timestamps: true });
productSchema.index({ gtin: 1, serial: 1 }, { unique: true });
export const Product = mongoose.models.Product ?? mongoose.model("Product", productSchema);
//# sourceMappingURL=Product.js.map
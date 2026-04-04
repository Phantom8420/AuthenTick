import mongoose, { Schema } from "mongoose";
const userSchema = new Schema({
    walletAddress: { type: String, required: true, unique: true, index: true },
    email: { type: String },
    role: {
        type: String,
        enum: ["MANUFACTURER", "DISTRIBUTOR", "RETAILER", "CUSTOMER", "ADMIN"],
        default: "CUSTOMER",
    },
    organizationName: { type: String },
    gln: { type: String },
}, { timestamps: true });
export const User = mongoose.models.User ?? mongoose.model("User", userSchema);
//# sourceMappingURL=User.js.map
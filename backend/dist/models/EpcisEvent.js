import mongoose, { Schema } from "mongoose";
const epcisEventSchema = new Schema({
    productId: { type: String, required: true, index: true },
    type: {
        type: String,
        enum: ["OBJECT_EVENT", "AGGREGATION_EVENT", "TRANSACTION_EVENT"],
        required: true,
    },
    action: { type: String, enum: ["ADD", "OBSERVE", "DELETE"], required: true },
    bizStep: { type: String, required: true },
    disposition: { type: String, required: true },
    readPoint: { type: String, required: true },
    eventTime: { type: Date, required: true },
    recordedTime: { type: Date, required: true },
    actor: { type: String, required: true },
}, { timestamps: false });
epcisEventSchema.index({ productId: 1, eventTime: -1 });
export const EpcisEvent = mongoose.models.EpcisEvent ?? mongoose.model("EpcisEvent", epcisEventSchema);
//# sourceMappingURL=EpcisEvent.js.map
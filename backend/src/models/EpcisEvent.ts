import mongoose, { Schema } from "mongoose";

export interface EpcisEventDoc {
  productId: string;
  type: "OBJECT_EVENT";
  action: "ADD" | "OBSERVE";
  bizStep: string;
  readPoint: string;
  eventTime: Date;
  recordedTime: Date;
  actor?: string;
}

const epcisEventSchema = new Schema<EpcisEventDoc>(
  {
    productId: { type: String, required: true },
    type: { type: String, enum: ["OBJECT_EVENT"], default: "OBJECT_EVENT" },
    action: { type: String, enum: ["ADD", "OBSERVE"], required: true },
    bizStep: { type: String, required: true },
    readPoint: { type: String, required: true },
    eventTime: { type: Date, required: true },
    recordedTime: { type: Date, required: true },
    actor: { type: String },
  },
  { timestamps: false },
);

epcisEventSchema.index({ productId: 1, eventTime: 1 });

export const EpcisEventModel =
  (mongoose.models.EpcisEvent as mongoose.Model<EpcisEventDoc>) ??
  mongoose.model<EpcisEventDoc>("EpcisEvent", epcisEventSchema);

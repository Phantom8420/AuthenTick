import { z } from "zod";
import { EpcisEvent } from "../models/EpcisEvent.js";
const ingestSchema = z.object({
    productId: z.string().min(1),
    type: z.enum(["OBJECT_EVENT", "AGGREGATION_EVENT", "TRANSACTION_EVENT"]),
    action: z.enum(["ADD", "OBSERVE", "DELETE"]),
    bizStep: z.string().min(1),
    disposition: z.string().min(1),
    readPoint: z.string().min(1),
    eventTime: z.coerce.date(),
    actor: z.string().min(1),
});
export async function ingestEpcisEvent(payload) {
    const data = ingestSchema.parse(payload);
    const recordedTime = new Date();
    const doc = await EpcisEvent.create({
        ...data,
        recordedTime,
    });
    return doc;
}
export async function listEventsForProduct(productId) {
    return EpcisEvent.find({ productId }).sort({ eventTime: -1 }).lean().exec();
}
//# sourceMappingURL=epcisIngestion.js.map
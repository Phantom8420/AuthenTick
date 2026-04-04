import { z } from "zod";
declare const ingestSchema: z.ZodObject<{
    productId: z.ZodString;
    type: z.ZodEnum<["OBJECT_EVENT", "AGGREGATION_EVENT", "TRANSACTION_EVENT"]>;
    action: z.ZodEnum<["ADD", "OBSERVE", "DELETE"]>;
    bizStep: z.ZodString;
    disposition: z.ZodString;
    readPoint: z.ZodString;
    eventTime: z.ZodDate;
    actor: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "OBJECT_EVENT" | "AGGREGATION_EVENT" | "TRANSACTION_EVENT";
    productId: string;
    action: "ADD" | "OBSERVE" | "DELETE";
    bizStep: string;
    disposition: string;
    readPoint: string;
    eventTime: Date;
    actor: string;
}, {
    type: "OBJECT_EVENT" | "AGGREGATION_EVENT" | "TRANSACTION_EVENT";
    productId: string;
    action: "ADD" | "OBSERVE" | "DELETE";
    bizStep: string;
    disposition: string;
    readPoint: string;
    eventTime: Date;
    actor: string;
}>;
export type IngestPayload = z.infer<typeof ingestSchema>;
export declare function ingestEpcisEvent(payload: unknown): Promise<any>;
export declare function listEventsForProduct(productId: string): Promise<(import("mongoose").FlattenMaps<any> & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export {};

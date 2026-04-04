import mongoose from "mongoose";
export type EpcisEventType = "OBJECT_EVENT" | "AGGREGATION_EVENT" | "TRANSACTION_EVENT";
export type EpcisAction = "ADD" | "OBSERVE" | "DELETE";
export interface EpcisEventDoc {
    productId: string;
    type: EpcisEventType;
    action: EpcisAction;
    bizStep: string;
    disposition: string;
    readPoint: string;
    eventTime: Date;
    recordedTime: Date;
    actor: string;
}
export declare const EpcisEvent: mongoose.Model<any, {}, {}, {}, any, any>;

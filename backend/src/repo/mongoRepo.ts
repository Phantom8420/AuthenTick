import mongoose from "mongoose";
import { EpcisEventModel } from "../models/EpcisEvent.js";
import { ProductModel, type ProductDoc } from "../models/Product.js";
import { UserModel } from "../models/User.js";
import { parseBizStep, type BizStep, type ProductStatus, type Role } from "../domain/lifecycle.js";
import { ConflictError, type ChainEvent, type NewProduct, type Product, type Repository } from "./types.js";

const toProduct = (d: ProductDoc): Product => ({
  tokenId: d.tokenId,
  name: d.name,
  gtin: d.gtin,
  serial: d.serial,
  batchId: d.batchId,
  manufacturerId: d.manufacturerId,
  currentOwner: d.currentOwner,
  status: d.status,
  lastStep: d.lastStep,
});

const toEvent = (d: { bizStep: string; readPoint: string; actor?: string | null; eventTime: Date }): ChainEvent => ({
  bizStep: d.bizStep,
  readPoint: d.readPoint,
  ...(d.actor ? { actor: d.actor } : {}),
  eventTime: d.eventTime.toISOString(),
});

const eventDoc = (productId: string, e: ChainEvent) => ({
  productId,
  action: parseBizStep(e.bizStep) === "commissioning" ? ("ADD" as const) : ("OBSERVE" as const),
  bizStep: e.bizStep,
  readPoint: e.readPoint,
  actor: e.actor,
  eventTime: new Date(e.eventTime),
  recordedTime: new Date(),
});

const isDuplicate = (e: unknown) => (e as { code?: number })?.code === 11000;

export class MongoRepo implements Repository {
  static async connect(uri: string) {
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri);
    // make sure unique indexes exist before the first write so duplicates are rejected
    await Promise.all([ProductModel.init(), UserModel.init(), EpcisEventModel.init()]);
    return new MongoRepo();
  }

  async createProduct(p: NewProduct, commissioning: ChainEvent) {
    try {
      const doc = await ProductModel.create({ ...p, status: "PRODUCTION", lastStep: "commissioning" });
      await EpcisEventModel.create(eventDoc(p.tokenId, commissioning));
      return toProduct(doc);
    } catch (e) {
      if (isDuplicate(e)) throw new ConflictError("This token ID or GTIN and serial number is already registered");
      throw e;
    }
  }

  async getProduct(tokenId: string) {
    const doc = await ProductModel.findOne({ tokenId }).lean<ProductDoc>().exec();
    return doc ? toProduct(doc) : null;
  }

  async advance(tokenId: string, expected: BizStep, next: BizStep, status: ProductStatus, event: ChainEvent) {
    // compare-and-set on lastStep so two concurrent writers cannot both win
    const doc = await ProductModel.findOneAndUpdate(
      { tokenId, lastStep: expected },
      { $set: { lastStep: next, status } },
      { new: true },
    )
      .lean<ProductDoc>()
      .exec();
    if (!doc) return null;
    await EpcisEventModel.create(eventDoc(tokenId, event));
    return toProduct(doc);
  }

  async listEvents(tokenId: string) {
    const docs = await EpcisEventModel.find({ productId: tokenId }).sort({ eventTime: 1, _id: 1 }).lean().exec();
    return docs.map(toEvent);
  }

  async getUser(address: string) {
    const doc = await UserModel.findOne({ address: address.toLowerCase() }).lean().exec();
    return doc ? { address: doc.address, role: doc.role } : null;
  }

  async setUserRole(address: string, role: Role) {
    const doc = await UserModel.findOneAndUpdate(
      { address: address.toLowerCase() },
      { $set: { role } },
      { upsert: true, new: true },
    )
      .lean()
      .exec();
    return { address: doc!.address, role: doc!.role };
  }

  async ping() {
    return mongoose.connection.readyState === 1;
  }

  async close() {
    await mongoose.disconnect();
  }
}

import { Product } from "../models/Product.js";
import { listEventsForProduct } from "./epcisIngestion.js";

export async function getProductMetadata(tokenId: string) {
  const product = await Product.findOne({ tokenId }).lean().exec();
  if (!product) return null;
  const events = await listEventsForProduct(tokenId);
  return { product, events };
}

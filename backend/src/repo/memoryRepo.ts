import { ConflictError, type ChainEvent, type NewProduct, type Product, type Repository, type UserRecord } from "./types.js";
import type { BizStep, ProductStatus, Role } from "../domain/lifecycle.js";

/** In-process store. Great for development and tests; data is lost on restart. */
export class MemoryRepo implements Repository {
  private products = new Map<string, Product>();
  private events = new Map<string, ChainEvent[]>();
  private users = new Map<string, UserRecord>();

  async createProduct(p: NewProduct, commissioning: ChainEvent): Promise<Product> {
    if (this.products.has(p.tokenId)) throw new ConflictError("A product with this token ID already exists");
    for (const existing of this.products.values()) {
      if (existing.gtin === p.gtin && existing.serial === p.serial) {
        throw new ConflictError("This GTIN and serial number is already registered");
      }
    }
    const product: Product = { ...p, status: "PRODUCTION", lastStep: "commissioning" };
    this.products.set(p.tokenId, product);
    this.events.set(p.tokenId, [commissioning]);
    return { ...product };
  }

  async getProduct(tokenId: string) {
    const p = this.products.get(tokenId);
    return p ? { ...p } : null;
  }

  async advance(tokenId: string, expected: BizStep, next: BizStep, status: ProductStatus, event: ChainEvent) {
    const p = this.products.get(tokenId);
    if (!p || p.lastStep !== expected) return null;
    p.lastStep = next;
    p.status = status;
    this.events.get(tokenId)!.push(event);
    return { ...p };
  }

  async listEvents(tokenId: string) {
    return [...(this.events.get(tokenId) ?? [])];
  }

  async getUser(address: string) {
    return this.users.get(address.toLowerCase()) ?? null;
  }

  async setUserRole(address: string, role: Role) {
    const user = { address: address.toLowerCase(), role };
    this.users.set(user.address, user);
    return user;
  }

  async ping() {
    return true;
  }

  async close() {}
}

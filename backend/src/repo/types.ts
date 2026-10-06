import type { BizStep, ProductStatus, Role } from "../domain/lifecycle.js";

export interface Product {
  tokenId: string;
  name: string;
  gtin: string;
  serial: string;
  batchId: string;
  manufacturerId: string;
  currentOwner: string;
  status: ProductStatus;
  /** Last business step recorded. Drives the lifecycle rules. */
  lastStep: BizStep;
}

export interface ChainEvent {
  bizStep: string;
  readPoint: string;
  actor?: string;
  eventTime: string;
}

export interface UserRecord {
  address: string;
  role: Role;
}

export type NewProduct = Omit<Product, "status" | "lastStep">;

export interface Repository {
  /** Creates the product and its commissioning event. Throws ConflictError on duplicates. */
  createProduct(p: NewProduct, commissioning: ChainEvent): Promise<Product>;
  getProduct(tokenId: string): Promise<Product | null>;
  /**
   * Appends an event only if the product's lastStep is still `expected`.
   * Returns null when another writer got there first.
   */
  advance(tokenId: string, expected: BizStep, next: BizStep, status: ProductStatus, event: ChainEvent): Promise<Product | null>;
  listEvents(tokenId: string): Promise<ChainEvent[]>;
  getUser(address: string): Promise<UserRecord | null>;
  setUserRole(address: string, role: Role): Promise<UserRecord>;
  ping(): Promise<boolean>;
  close(): Promise<void>;
}

export class ConflictError extends Error {}

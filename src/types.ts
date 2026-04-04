export enum UserRole {
  MANUFACTURER = 'MANUFACTURER',
  DISTRIBUTOR = 'DISTRIBUTOR',
  RETAILER = 'RETAILER',
  CUSTOMER = 'CUSTOMER',
  GUEST = 'GUEST',
}

export interface Product {
  id: string; // NFT Token ID
  gtin: string;
  serial: string;
  name: string;
  manufacturer: string;
  batchId: string;
  createdAt: number;
  currentOwner: string;
  status: 'PRODUCTION' | 'IN_TRANSIT' | 'RETAIL' | 'SOLD';
  imageUrl?: string;
}

export interface EPCISEvent {
  id: string;
  productId: string;
  type: 'OBJECT_EVENT' | 'AGGREGATION_EVENT' | 'TRANSACTION_EVENT';
  action: 'ADD' | 'OBSERVE' | 'DELETE';
  bizStep: string; // e.g., 'shipping', 'receiving', 'retail_selling'
  disposition: string; // e.g., 'in_transit', 'sellable_not_yet_sold'
  readPoint: string; // Location GLN
  eventTime: number;
  recordedTime: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  organizationName?: string;
  gln?: string; // Global Location Number for GS1
}

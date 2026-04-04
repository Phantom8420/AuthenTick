// backend/src/storage.ts
export interface Product {
    tokenId: string;
    name: string;
    gtin: string;
    serial: string;
    batchId?: string;
    manufacturerId?: string;
    currentOwner?: string;
    status?: string;
  }
  
  export interface Event {
    bizStep: string;
    readPoint: string;
    actor?: string;
    eventTime: string;
  }
  
  export const products: Record<string, Product> = {};
  export const events: Record<string, Event[]> = {};
  
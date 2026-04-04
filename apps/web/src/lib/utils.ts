import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function generateNFTId(gtin: string, serial: string) {
  // Simple hash simulation for NFT ID
  return `0x${Buffer.from(gtin + serial).toString('hex').slice(0, 40)}`;
}

export function formatFirestoreTimestamp(value: unknown): string {
  if (
    value != null &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().toLocaleDateString();
  }
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return new Date(value).toLocaleDateString();
  }
  return '—';
}

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

export const BIZ_STEPS = ["commissioning", "shipping", "receiving", "storing", "selling"] as const;
export type BizStep = (typeof BIZ_STEPS)[number];

export type ProductStatus = "PRODUCTION" | "IN_TRANSIT" | "RETAIL" | "SOLD";
export type Role = "MANUFACTURER" | "DISTRIBUTOR" | "RETAILER" | "CUSTOMER" | "ADMIN";

const URN = "urn:epcglobal:cbv:bizstep:";

export const toUrn = (step: BizStep) => `${URN}${step}`;

/** Accepts "shipping" or the full CBV urn. Returns null for anything unknown. */
export function parseBizStep(input: string): BizStep | null {
  const key = (input.startsWith(URN) ? input.slice(URN.length) : input).toLowerCase();
  return (BIZ_STEPS as readonly string[]).includes(key) ? (key as BizStep) : null;
}

/** What may legally follow each step. A sold item is terminal. */
const NEXT: Record<BizStep, readonly BizStep[]> = {
  commissioning: ["shipping"],
  shipping: ["receiving"],
  receiving: ["shipping", "storing"],
  storing: ["shipping", "selling"],
  selling: [],
};

export const canFollow = (prev: BizStep, next: BizStep) => NEXT[prev].includes(next);

export const allowedAfter = (prev: BizStep) => NEXT[prev];

export const statusAfter = (step: BizStep): ProductStatus =>
  ({
    commissioning: "PRODUCTION",
    shipping: "IN_TRANSIT",
    receiving: "IN_TRANSIT",
    storing: "RETAIL",
    selling: "SOLD",
  })[step] as ProductStatus;

/** Roles allowed to record each step. Admins may always record. */
export const ROLES_FOR_STEP: Record<Exclude<BizStep, "commissioning">, readonly Role[]> = {
  shipping: ["MANUFACTURER", "DISTRIBUTOR", "RETAILER"],
  receiving: ["DISTRIBUTOR", "RETAILER"],
  storing: ["RETAILER"],
  selling: ["RETAILER"],
};

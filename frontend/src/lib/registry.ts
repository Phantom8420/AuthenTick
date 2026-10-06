import { useEffect, useState } from "react";
import { apiGet } from "@/api/client";
import { bizKey } from "@/lib/format";
import type { ChainEvent } from "@/components/Timeline";

const KEY = "authentick.recent";
const MAX = 12;

export type ProductRecord = {
  product: {
    tokenId: string;
    name: string;
    gtin: string;
    serial: string;
    batchId?: string;
    manufacturerId?: string;
    status?: string;
    currentOwner?: string;
  };
  events: ChainEvent[];
};

const read = (): string[] => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
};

/** Remember a token the user minted or looked up so the home page can list it. */
export function remember(tokenId: string) {
  try {
    const next = [tokenId, ...read().filter((t) => t !== tokenId)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
}

export const STAGES = [
  { key: "commissioning", label: "Minted", color: "var(--g-green)" },
  { key: "shipping", label: "Shipped", color: "var(--g-amber)" },
  { key: "receiving", label: "Received", color: "var(--g-yellow)" },
  { key: "storing", label: "Stored", color: "var(--g-red)" },
] as const;

export const countStages = (events: ChainEvent[]) =>
  STAGES.map((s) => events.filter((e) => bizKey(e.bizStep) === s.key).length);

/** Loads metadata for every remembered token; ones the API no longer knows are dropped. */
export function useRecent() {
  const [records, setRecords] = useState<ProductRecord[] | null>(null);

  useEffect(() => {
    let live = true;
    const ids = read();
    Promise.allSettled(ids.map((id) => apiGet<ProductRecord>(`/api/metadata/${encodeURIComponent(id)}`))).then(
      (res) => {
        if (!live) return;
        setRecords(res.flatMap((r) => (r.status === "fulfilled" ? [r.value] : [])));
      },
    );
    return () => {
      live = false;
    };
  }, []);

  return records;
}

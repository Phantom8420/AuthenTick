/**
 * In-browser stand-in for the AuthenTick API, used by demo mode so every flow
 * (mint, record events, verify, ownership) works without a backend. It mirrors
 * the real routes and error shapes and persists to localStorage.
 */

const FLAG = "authentick.demo";
const STORE = "authentick.mock";
export const DEMO_TOKEN = "0xde70a11ce0000001";

type Product = {
  tokenId: string;
  name: string;
  gtin: string;
  serial: string;
  batchId?: string;
  manufacturerId?: string;
  currentOwner?: string;
  status?: string;
};
type Ev = { bizStep: string; readPoint: string; actor?: string; eventTime: string };
type Store = { products: Record<string, Product>; events: Record<string, Ev[]> };

export const isDemo = () => {
  try {
    return localStorage.getItem(FLAG) === "1";
  } catch {
    return false;
  }
};

const announce = (auto: boolean) => window.dispatchEvent(new CustomEvent("authentick:demo", { detail: { auto } }));

export function enableDemo(auto = false) {
  try {
    localStorage.setItem(FLAG, "1");
  } catch {
    /* storage unavailable: demo lasts for this tab only via memory fallback */
    memoryOn = true;
  }
  announce(auto);
}

export function disableDemo() {
  memoryOn = false;
  try {
    localStorage.removeItem(FLAG);
  } catch {
    /* ignore */
  }
  announce(false);
}

let memoryOn = false;
export const demoActive = () => memoryOn || isDemo();

const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * 864e5).toISOString();
const step = (k: string) => (k === "commissioning" ? k : `urn:epcglobal:cbv:bizstep:${k}`);

function seed(): Store {
  const mk = (tokenId: string, name: string, gtin: string, serial: string, batchId: string, status: string, evs: Array<[string, number]>) => ({
    p: { tokenId, name, gtin, serial, batchId, manufacturerId: "manufacturer-demo", currentOwner: "manufacturer-demo", status },
    e: evs.map(([k, ago]) => ({ bizStep: step(k), readPoint: "urn:epc:id:sgln:1234567.0000.1", actor: "partner-01", eventTime: iso(ago) })),
  });
  const rows = [
    mk(DEMO_TOKEN, "Aurelia Chronograph", "04012345678901", "SN-90210", "BATCH-A1", "RETAIL", [["commissioning", 9], ["shipping", 7], ["receiving", 4], ["storing", 2]]),
    mk("0x91bb02aa77c1e4d0", "Nocturne Satchel", "04012345678902", "SN-1001", "BATCH-N7", "IN_TRANSIT", [["commissioning", 3], ["shipping", 1]]),
  ];
  const s: Store = { products: {}, events: {} };
  rows.forEach(({ p, e }) => {
    s.products[p.tokenId] = p;
    s.events[p.tokenId] = e;
  });
  return s;
}

let mem: Store | null = null;
const load = (): Store => {
  if (mem) return mem;
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) return (mem = JSON.parse(raw) as Store);
  } catch {
    /* fall through to a fresh seed */
  }
  return (mem = seed());
};
const save = (s: Store) => {
  mem = s;
  try {
    localStorage.setItem(STORE, JSON.stringify(s));
  } catch {
    /* in-memory only */
  }
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function mockRequest<T>(method: "GET" | "POST", path: string, body?: any): Promise<T> {
  await wait(220 + Math.random() * 220);
  const s = load();
  const p = path.split("?")[0].split("/").filter(Boolean).slice(1).map(decodeURIComponent);

  // POST /api/products
  if (method === "POST" && p[0] === "products" && p.length === 1) {
    const b = body ?? {};
    if (!b.tokenId || !b.name || !b.serial) throw new Error("Missing required fields");
    if (!/^\d{14}$/.test(String(b.gtin ?? ""))) throw new Error("GTIN must be exactly 14 digits");
    const product: Product = {
      tokenId: b.tokenId,
      name: b.name,
      gtin: b.gtin,
      serial: b.serial,
      batchId: b.batchId,
      manufacturerId: b.manufacturerId,
      currentOwner: b.manufacturerId,
      status: "PRODUCTION",
    };
    s.products[b.tokenId] = product;
    s.events[b.tokenId] = [{ bizStep: "commissioning", readPoint: "GLN-FACTORY", actor: b.manufacturerId, eventTime: new Date().toISOString() }];
    save(s);
    return product as T;
  }

  // GET /api/metadata/:id
  if (method === "GET" && p[0] === "metadata") {
    const product = s.products[p[1]];
    if (!product) throw new Error("Product not found");
    return { product, events: s.events[p[1]] ?? [] } as T;
  }

  // POST /api/events
  if (method === "POST" && p[0] === "events" && p.length === 1) {
    const { tokenId, bizStep, readPoint, actor } = body ?? {};
    if (!tokenId || !bizStep || !readPoint) throw new Error("Missing required fields");
    (s.events[tokenId] ||= []).push({ bizStep, readPoint, actor, eventTime: new Date().toISOString() });
    const prod = s.products[tokenId];
    if (prod) {
      const k = String(bizStep).split(":").pop();
      prod.status = k === "storing" ? "RETAIL" : "IN_TRANSIT";
    }
    save(s);
    return s.events[tokenId] as T;
  }

  // GET /api/events/product/:id
  if (method === "GET" && p[0] === "events" && p[1] === "product") {
    return (s.events[p[2]] ?? []) as T;
  }

  // POST /api/verify/ownership. Demo wallets are not tied to a real chain,
  // so any connected wallet is accepted for a product that exists.
  if (method === "POST" && p[0] === "verify" && p[1] === "ownership") {
    const { tokenId, owner } = body ?? {};
    if (!tokenId || !owner) throw new Error("Missing tokenId or owner");
    if (!s.products[tokenId]) throw new Error("Product not found");
    return { verified: true, tokenId, owner } as T;
  }

  throw new Error("not found");
}

/** Wipe demo data back to the seeded state. */
export function resetMock() {
  mem = null;
  try {
    localStorage.removeItem(STORE);
  } catch {
    /* ignore */
  }
}

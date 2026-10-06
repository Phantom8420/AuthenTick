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

const announce = (auto: boolean, reason?: string) =>
  window.dispatchEvent(new CustomEvent("authentick:demo", { detail: { auto, reason } }));

/** True for the built-in demo token, however the user typed it. */
export const isDemoToken = (id: string) => id.trim().toLowerCase() === DEMO_TOKEN;

export function enableDemo(auto = false, reason?: string) {
  try {
    localStorage.setItem(FLAG, "1");
  } catch {
    /* storage unavailable: demo lasts for this tab only via memory fallback */
    memoryOn = true;
  }
  announce(auto, reason);
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
const step = (k: string) => `urn:epcglobal:cbv:bizstep:${k}`;

// Mirrors backend/src/domain: keep the two in step.
const NEXT: Record<string, string[]> = {
  commissioning: ["shipping"],
  shipping: ["receiving"],
  receiving: ["shipping", "storing"],
  storing: ["shipping", "selling"],
  selling: [],
};
const bizKey = (s: string) => (s.split(":").pop() ?? s).toLowerCase();

export function isValidGtin14(v: string) {
  if (!/^\d{14}$/.test(v)) return false;
  let sum = 0;
  for (let i = 0; i < 13; i++) sum += Number(v[i]) * ((12 - i) % 2 === 0 ? 3 : 1);
  return (10 - (sum % 10)) % 10 === Number(v[13]);
}

function seed(): Store {
  const mk = (tokenId: string, name: string, gtin: string, serial: string, batchId: string, status: string, evs: Array<[string, number]>) => ({
    p: { tokenId, name, gtin, serial, batchId, manufacturerId: "manufacturer-demo", currentOwner: "manufacturer-demo", status },
    e: evs.map(([k, ago]) => ({ bizStep: step(k), readPoint: "urn:epc:id:sgln:1234567.0000.1", actor: "partner-01", eventTime: iso(ago) })),
  });
  const rows = [
    mk(DEMO_TOKEN, "Aurelia Chronograph", "04012345678901", "SN-90210", "BATCH-A1", "PRODUCTION", [["commissioning", 0.002]]),
    mk("0x91bb02aa77c1e4d0", "Nocturne Satchel", "00012345678905", "SN-1001", "BATCH-N7", "IN_TRANSIT", [["commissioning", 3], ["shipping", 1]]),
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

/** Hex token ids are case-insensitive, like on the real API. */
const canon = (t: unknown) => (typeof t === "string" ? t.trim().replace(/^0x[0-9a-f]+$/i, (m) => m.toLowerCase()) : t);

export async function mockRequest<T>(method: "GET" | "POST", path: string, rawBody?: any): Promise<T> {
  await wait(220 + Math.random() * 220);
  const s = load();
  const p = path.split("?")[0].split("/").filter(Boolean).slice(1).map(decodeURIComponent).map((x) => canon(x) as string);
  const body = rawBody && typeof rawBody === "object" && "tokenId" in rawBody ? { ...rawBody, tokenId: canon(rawBody.tokenId) } : rawBody;

  // POST /api/products
  if (method === "POST" && p[0] === "products" && p.length === 1) {
    const b = body ?? {};
    if (!b.tokenId || !b.name || !b.serial) throw new Error("Missing required fields");
    if (!isValidGtin14(String(b.gtin ?? ""))) throw new Error("gtin: GTIN must be 14 digits with a valid GS1 check digit");
    if (s.products[b.tokenId]) throw new Error("A product with this token ID already exists");
    if (Object.values(s.products).some((x) => x.gtin === b.gtin && x.serial === b.serial)) {
      throw new Error("This GTIN and serial number is already registered");
    }
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
    s.events[b.tokenId] = [{ bizStep: step("commissioning"), readPoint: "GLN-FACTORY", actor: b.manufacturerId, eventTime: new Date().toISOString() }];
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
    const key = bizKey(String(bizStep));
    if (!(key in NEXT)) throw new Error(`Unknown business step "${bizStep}"`);
    if (key === "commissioning") throw new Error("Commissioning is recorded automatically when a product is minted");
    const prod = s.products[tokenId];
    if (!prod) throw new Error("Product not found");
    const list = (s.events[tokenId] ||= []);
    const last = bizKey(list[list.length - 1]?.bizStep ?? "commissioning");
    if (!NEXT[last].includes(key)) {
      throw new Error(
        NEXT[last].length
          ? `Cannot record "${key}" after "${last}". Next allowed: ${NEXT[last].join(", ")}.`
          : "This product is already sold; no further events are allowed.",
      );
    }
    list.push({ bizStep: step(key), readPoint, actor, eventTime: new Date().toISOString() });
    prod.status = key === "selling" ? "SOLD" : key === "storing" ? "RETAIL" : "IN_TRANSIT";
    save(s);
    return list as T;
  }

  // GET /api/events/product/:id
  if (method === "GET" && p[0] === "events" && p[1] === "product") {
    return (s.events[p[2]] ?? []) as T;
  }

  // POST /api/verify/challenge and /api/verify/ownership. Demo wallets are not
  // tied to a real chain, so any signed claim is accepted for a product that exists.
  if (method === "POST" && p[0] === "verify" && p[1] === "challenge") {
    if (!s.products[String(body?.tokenId ?? "").toLowerCase()]) throw new Error("Product not found");
    return { message: `AuthenTick demo challenge for ${body.tokenId}` } as T;
  }
  if (method === "POST" && p[0] === "verify" && p[1] === "ownership") {
    const { tokenId, owner } = body ?? {};
    if (!tokenId || !owner) throw new Error("Missing tokenId or owner");
    if (!s.products[tokenId]) throw new Error("Product not found");
    return { verified: true, tokenId, owner } as T;
  }

  throw new Error("not found");
}

/** Put the demo token back to a freshly minted item so the journey can be replayed. */
export function resetDemoToken() {
  const s = load();
  const fresh = seed();
  s.products[DEMO_TOKEN] = fresh.products[DEMO_TOKEN];
  s.events[DEMO_TOKEN] = [{ ...fresh.events[DEMO_TOKEN][0], eventTime: new Date().toISOString() }];
  save(s);
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

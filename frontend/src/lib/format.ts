export const short = (s: string, head = 6, tail = 4) =>
  s.length > head + tail + 3 ? `${s.slice(0, head)}…${s.slice(-tail)}` : s;

/** "urn:epcglobal:cbv:bizstep:shipping" -> "shipping" */
export const bizKey = (step: string) => (step.split(":").pop() || step).toLowerCase();

export const bizLabel = (step: string) => {
  const k = bizKey(step);
  return k.charAt(0).toUpperCase() + k.slice(1);
};

export const statusLabel = (status?: string) => (status ?? "PRODUCTION").replace("_", " ");

/** Accepts a raw token id or a full /product/<id> link (what the minted QR encodes). */
export function tokenFromScan(text: string): string {
  const m = text.match(/\/product\/([^/?#\s]+)/);
  return decodeURIComponent((m ? m[1] : text).trim());
}

export const randomToken = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return "0x" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
};

import { useState } from "react";
import { Package, Shield } from "lucide-react";
import { apiPost } from "@/api/client";
import { QRCodeSVG } from "qrcode.react";

export default function ManufacturerPage() {
  const [busy, setBusy] = useState(false);
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [form, setForm] = useState({
    tokenId: "",
    name: "",
    gtin: "",
    serial: "",
    batchId: "",
    manufacturerId: "manufacturer-demo",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setTokenId(null);
    try {
      await apiPost("/api/products", {
        tokenId: form.tokenId,
        name: form.name,
        gtin: form.gtin,
        serial: form.serial,
        batchId: form.batchId,
        manufacturerId: form.manufacturerId,
      });
      setTokenId(form.tokenId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Mint failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 className="title" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>Manufacturer Portal</h1>
        <p className="subtitle" style={{ margin: 0 }}>Register a product and create its initial EPCIS commissioning event.</p>
      </div>

      <div className="card" style={{ marginBottom: "2.5rem" }}>
        <form onSubmit={onSubmit}>
          <div className="grid-2" style={{ gap: "1.5rem", marginBottom: "1.5rem" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Token ID</label>
              <input required placeholder="0x… or numeric id" className="form-input text-mono text-sm" value={form.tokenId} onChange={(e) => setForm({ ...form, tokenId: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Product Name</label>
              <input required placeholder="e.g. Luxury Handbag" className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
          </div>

          <div className="grid-2" style={{ gap: "1.5rem", marginBottom: "1.5rem" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">GTIN (14)</label>
              <input required minLength={14} maxLength={14} placeholder="14-digit GTIN" className="form-input text-mono text-sm" value={form.gtin} onChange={(e) => setForm({ ...form, gtin: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Serial Number</label>
              <input required placeholder="e.g. SN-90210" className="form-input" value={form.serial} onChange={(e) => setForm({ ...form, serial: e.target.value })} />
            </div>
          </div>

          <div className="grid-2" style={{ gap: "1.5rem", marginBottom: "2rem" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Batch ID</label>
              <input required placeholder="e.g. BATCH-A1" className="form-input" value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Manufacturer ID</label>
              <input required className="form-input text-mono text-sm" value={form.manufacturerId} onChange={(e) => setForm({ ...form, manufacturerId: e.target.value })} />
            </div>
          </div>

          <button type="submit" disabled={busy} className="btn btn-primary" style={{ width: "100%", padding: "1rem" }}>
             {busy ? "Saving…" : <><Shield size={20} /> Register Product & Commission</>}
          </button>
        </form>
      </div>

      {tokenId && (
        <div className="card" style={{ borderColor: "var(--accent-green)", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Package size={40} style={{ color: "var(--accent-green)", marginBottom: "1rem" }} />
          <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1.5rem" }}>Product Registered Successfully</h3>
          <div style={{ backgroundColor: "white", padding: "1rem", borderRadius: "1rem", marginBottom: "1.5rem", display: "inline-block" }}>
             <QRCodeSVG value={tokenId} size={160} />
          </div>
          <code className="text-mono text-xs text-muted" style={{ padding: "0.5rem 1rem", backgroundColor: "var(--bg-primary)", borderRadius: "0.5rem" }}>{tokenId}</code>
        </div>
      )}
    </div>
  );
}
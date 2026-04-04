import { useState } from "react";
import { Truck } from "lucide-react";
import { apiPost } from "@/api/client";

export default function SupplyChainPage() {
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    tokenId: "",
    bizStep: "urn:epcglobal:cbv:bizstep:shipping",
    readPoint: "urn:epc:id:sgln:1234567.0000.1",
    actor: "logistics-partner-01"
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSuccess(false);
    try {
      await apiPost(`/api/products/${encodeURIComponent(form.tokenId)}/events`, {
        bizStep: form.bizStep,
        readPoint: form.readPoint,
        actor: form.actor
      });
      setSuccess(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Event failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 className="title" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>Supply Chain Portal</h1>
        <p className="subtitle" style={{ margin: 0 }}>Record transit and handling events for products in the supply chain.</p>
      </div>

      <div className="card">
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Product Token ID</label>
            <input required className="form-input text-mono text-sm" placeholder="Scan or enter token ID" value={form.tokenId} onChange={(e) => setForm({ ...form, tokenId: e.target.value })} />
          </div>

          <div className="grid-2" style={{ gap: "1.5rem", marginBottom: "1.5rem" }}>
             <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Business Step</label>
              <select required className="form-input" value={form.bizStep} onChange={(e) => setForm({ ...form, bizStep: e.target.value })}>
                <option value="urn:epcglobal:cbv:bizstep:shipping">Shipping</option>
                <option value="urn:epcglobal:cbv:bizstep:receiving">Receiving</option>
                <option value="urn:epcglobal:cbv:bizstep:storing">Storing</option>
              </select>
            </div>
             <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Read Point (Location ID)</label>
              <input required className="form-input text-mono text-sm" value={form.readPoint} onChange={(e) => setForm({ ...form, readPoint: e.target.value })} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "2.5rem" }}>
            <label className="form-label">Actor ID</label>
             <input required className="form-input text-mono text-sm" value={form.actor} onChange={(e) => setForm({ ...form, actor: e.target.value })} />
          </div>

          <button type="submit" disabled={busy} className="btn btn-primary" style={{ width: "100%", padding: "1rem" }}>
             {busy ? "Recording…" : <><Truck size={20} /> Record EPCIS Event</>}
          </button>
        </form>
        {success && (
           <div style={{ marginTop: "1.5rem", padding: "1rem", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "var(--accent-green)", borderRadius: "0.75rem", border: "1px solid rgba(16, 185, 129, 0.2)", textAlign: "center", fontWeight: 500 }}>
             Event successfully recorded to supply chain ledger!
           </div>
        )}
      </div>
    </div>
  );
}
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Boxes, PackageOpen, Radio, Route, Truck } from "lucide-react";
import { apiGet, apiPost } from "@/api/client";
import { Field } from "@/components/Field";
import { Timeline, type ChainEvent } from "@/components/Timeline";
import { useToast } from "@/context/ToastContext";
import { remember } from "@/lib/registry";

const steps = [
  { key: "shipping", label: "Shipping", icon: Truck },
  { key: "receiving", label: "Receiving", icon: PackageOpen },
  { key: "storing", label: "Storing", icon: Boxes },
] as const;

export default function SupplyChainPage() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<(typeof steps)[number]["key"]>("shipping");
  const [history, setHistory] = useState<{ id: string; events: ChainEvent[] } | null>(null);
  const [form, setForm] = useState({
    tokenId: "",
    readPoint: "urn:epc:id:sgln:1234567.0000.1",
    actor: "logistics-partner-01",
  });
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiPost("/api/events", {
        tokenId: form.tokenId,
        bizStep: `urn:epcglobal:cbv:bizstep:${step}`,
        readPoint: form.readPoint,
        actor: form.actor,
      });
      const events = await apiGet<ChainEvent[]>(`/api/events/product/${encodeURIComponent(form.tokenId)}`);
      remember(form.tokenId);
      setHistory({ id: form.tokenId, events });
      toast("Event recorded to the ledger.", "ok");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Event failed", "err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-head">
        <span className="kicker">Supply chain portal</span>
        <h1 className="d d-xl">
          Record the <span className="outline">handoff.</span>
        </h1>
        <p className="muted">
          Log shipping, receiving and storage as GS1 EPCIS events. Each one extends the product's
          provenance trail.
        </p>
      </div>

      <div className="work">
        <form className="card" onSubmit={onSubmit}>
          <div className="card-label">
            <Route size={18} /> New event
          </div>

          <div className="form-grid">
            <Field full mono required label="Product token ID" placeholder="Paste or scan a token ID" value={form.tokenId} onChange={set("tokenId")} />

            <div className="field full">
              <label>Business step</label>
              <div className="seg" role="radiogroup">
                {steps.map(({ key, label, icon: Icon }) => (
                  <button
                    type="button"
                    key={key}
                    role="radio"
                    aria-checked={step === key}
                    className={step === key ? "on" : ""}
                    onClick={() => setStep(key)}
                  >
                    {step === key && (
                      <motion.span
                        layoutId="seg-bg"
                        className="seg-bg"
                        transition={{ type: "spring", stiffness: 440, damping: 34 }}
                      />
                    )}
                    <Icon size={16} /> {label}
                  </button>
                ))}
              </div>
            </div>

            <Field mono required label="Read point" hint="location" value={form.readPoint} onChange={set("readPoint")} />
            <Field mono required label="Actor" value={form.actor} onChange={set("actor")} />
          </div>

          <button className="btn btn-block" style={{ marginTop: 30 }} disabled={busy}>
            {busy ? (
              <>
                <span className="spinner" /> Recording…
              </>
            ) : (
              <>
                <Radio size={18} /> Record EPCIS event
              </>
            )}
          </button>
        </form>

        <div className="card">
          <div className="card-label">
            <Route size={18} /> Live trail
          </div>
          {history ? (
            <>
              <p className="mono muted" style={{ marginBottom: 22, overflowWrap: "anywhere" }}>
                {history.id}
              </p>
              <Timeline events={history.events} />
            </>
          ) : (
            <div className="empty">
              <Truck size={36} />
              Record an event and the product's trail will appear here.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

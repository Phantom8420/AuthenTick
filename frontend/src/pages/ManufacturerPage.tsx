import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Dices, Factory, FlaskConical, Sparkles } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { apiPost } from "@/api/client";
import { Field } from "@/components/Field";
import { useToast } from "@/context/ToastContext";
import { randomToken } from "@/lib/format";
import { remember } from "@/lib/registry";

const empty = {
  tokenId: "",
  name: "",
  gtin: "",
  serial: "",
  batchId: "",
  manufacturerId: "manufacturer-demo",
};

export default function ManufacturerPage() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [minted, setMinted] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState(empty);
  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const link = minted ? `${window.location.origin}/product/${encodeURIComponent(minted)}` : "";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiPost("/api/products", form);
      remember(form.tokenId);
      setMinted(form.tokenId);
      toast("Digital twin minted and commissioned.", "ok");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Mint failed", "err");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <>
      <div className="page-head">
        <span className="kicker">Manufacturer portal</span>
        <h1 className="d d-xl">
          Mint a <span className="outline">digital twin.</span>
        </h1>
        <p className="muted">
          Register a serialized product and create its first EPCIS commissioning event. You'll get a QR
          code to print on the item.
        </p>
      </div>

      <div className="work">
        <form className="card" onSubmit={onSubmit}>
          <div className="card-label">
            <Factory size={18} /> Product details
            <button
              type="button"
              className="btn btn-sm"
              style={{ marginLeft: "auto" }}
              onClick={() =>
                setForm({
                  tokenId: randomToken(),
                  name: "Demo Chronograph",
                  gtin: "04012345678901",
                  serial: `SN-${Math.floor(1000 + Math.random() * 9000)}`,
                  batchId: "BATCH-DEMO",
                  manufacturerId: "manufacturer-demo",
                })
              }
            >
              <FlaskConical size={14} /> Fill demo data
            </button>
          </div>

          <div className="form-grid">
            <Field
              full
              mono
              required
              label="Token ID"
              placeholder="0x… or numeric id"
              value={form.tokenId}
              onChange={set("tokenId")}
              action={
                <button
                  type="button"
                  className="round sm"
                  style={{ width: 52, height: 52 }}
                  title="Generate a random token ID"
                  onClick={() => setForm((f) => ({ ...f, tokenId: randomToken() }))}
                >
                  <Dices size={18} />
                </button>
              }
            />
            <Field full required label="Product name" placeholder="e.g. Luxury handbag" value={form.name} onChange={set("name")} />
            <Field
              mono
              required
              label="GTIN"
              hint="14 digits"
              placeholder="04012345678901"
              inputMode="numeric"
              minLength={14}
              maxLength={14}
              pattern="\d{14}"
              value={form.gtin}
              onChange={set("gtin")}
            />
            <Field required label="Serial number" placeholder="SN-90210" value={form.serial} onChange={set("serial")} />
            <Field required label="Batch ID" placeholder="BATCH-A1" value={form.batchId} onChange={set("batchId")} />
            <Field mono required label="Manufacturer ID" value={form.manufacturerId} onChange={set("manufacturerId")} />
          </div>

          <button className="btn btn-block" style={{ marginTop: 30 }} disabled={busy}>
            {busy ? (
              <>
                <span className="spinner" /> Minting…
              </>
            ) : (
              <>
                <Sparkles size={18} /> Register &amp; commission
              </>
            )}
          </button>
        </form>

        <div className="stack">
          <AnimatePresence mode="wait">
            {minted ? (
              <motion.div
                key="done"
                className="card"
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="minted">
                  <span className="tag">Commissioned</span>
                  <motion.div
                    className="qr-frame"
                    initial={{ rotate: -6, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.15 }}
                  >
                    <QRCodeSVG value={link} size={180} bgColor="#e8f2f1" fgColor="#031010" level="M" />
                  </motion.div>
                  <div className="token-pill mono">
                    <span>{minted}</span>
                    <button onClick={copy} title="Copy product link" aria-label="Copy product link">
                      {copied ? <Check size={15} color="var(--teal)" /> : <Copy size={15} />}
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                    <Link to={`/product/${encodeURIComponent(minted)}`} className="btn btn-sm">
                      View record <ArrowUpRight size={15} />
                    </Link>
                    <button
                      className="btn btn-sm"
                      onClick={() => {
                        setMinted(null);
                        setForm(empty);
                      }}
                    >
                      Mint another
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="idle" className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="empty">
                  <div className="qr-frame" style={{ opacity: 0.1, padding: 14 }}>
                    <QRCodeSVG value="authentick" size={120} bgColor="#e8f2f1" fgColor="#031010" />
                  </div>
                  Your product's QR code will appear here once it's minted.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

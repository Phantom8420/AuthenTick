import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Fingerprint, History, KeyRound, ScanLine, Wallet } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { apiGet, apiPost } from "@/api/client";
import { Seal } from "@/components/Seal";
import { Timeline } from "@/components/Timeline";
import { useToast } from "@/context/ToastContext";
import { useWallet } from "@/context/WalletContext";
import { short, statusLabel } from "@/lib/format";
import { STAGES, countStages, remember, type ProductRecord } from "@/lib/registry";

type Load =
  | { state: "loading" }
  | { state: "ok"; data: ProductRecord }
  | { state: "missing" }
  | { state: "error"; message: string };

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
});

export default function ProductDetailsPage() {
  const { id = "" } = useParams();
  const toast = useToast();
  const { account, connectWallet } = useWallet();
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [checking, setChecking] = useState(false);
  const [owned, setOwned] = useState<boolean | null>(null);

  useEffect(() => {
    setLoad({ state: "loading" });
    setOwned(null);
    apiGet<ProductRecord>(`/api/metadata/${encodeURIComponent(id)}`)
      .then((data) => {
        remember(data.product.tokenId);
        setLoad({ state: "ok", data });
      })
      .catch((e: Error) =>
        setLoad(/not found/i.test(e.message) ? { state: "missing" } : { state: "error", message: e.message }),
      );
  }, [id]);

  async function proveOwnership() {
    if (!account) return connectWallet();
    setChecking(true);
    try {
      const res = await apiPost<{ verified: boolean }>("/api/verify/ownership", { tokenId: id, owner: account });
      setOwned(res.verified);
      toast(
        res.verified ? "Ownership confirmed for this wallet." : "This wallet does not own the product.",
        res.verified ? "ok" : "err",
      );
    } catch (e) {
      toast(e instanceof Error ? e.message : "Verification failed", "err");
    } finally {
      setChecking(false);
    }
  }

  if (load.state === "loading") {
    return (
      <div className="stack" style={{ marginTop: 20 }}>
        <div className="skel" style={{ height: 22, width: 110, borderRadius: 8 }} />
        <div className="skel" style={{ height: 190, borderRadius: 40 }} />
        <div className="work">
          <div className="skel" style={{ height: 320 }} />
          <div className="skel" style={{ height: 320 }} />
        </div>
      </div>
    );
  }

  if (load.state === "missing" || load.state === "error") {
    const missing = load.state === "missing";
    return (
      <>
        <Link to="/verify" className="back">
          <ArrowLeft size={16} /> Scan again
        </Link>
        <motion.div className="sheet verdict bad" {...rise()}>
          <Seal ok={false} />
          <div>
            <span className="tag red">{missing ? "Not registered" : "Lookup failed"}</span>
            <h1 className="d d-lg">{missing ? "We can't verify this product." : "Something went wrong."}</h1>
            <p className="muted" style={{ maxWidth: "52ch" }}>
              {missing
                ? "No record exists for this ID. It may be counterfeit, or the code may be damaged. Treat it with caution."
                : load.state === "error" && load.message}
            </p>
            <p className="mono" style={{ marginTop: 14, color: "var(--faint)", overflowWrap: "anywhere" }}>
              {id}
            </p>
          </div>
        </motion.div>
      </>
    );
  }

  const { product, events } = load.data;
  const link = `${window.location.origin}/product/${encodeURIComponent(product.tokenId)}`;
  const counts = countStages(events);
  const rows: Array<[string, string]> = [
    ["GTIN", product.gtin],
    ["Serial", product.serial],
    ...(product.batchId ? ([["Batch", product.batchId]] as Array<[string, string]>) : []),
    ...(product.manufacturerId ? ([["Manufacturer", product.manufacturerId]] as Array<[string, string]>) : []),
    ...(product.currentOwner ? ([["Owner", short(product.currentOwner, 8, 6)]] as Array<[string, string]>) : []),
  ];

  return (
    <>
      <Link to="/verify" className="back">
        <ArrowLeft size={16} /> Scan another
      </Link>

      <motion.div className="sheet verdict ok" {...rise()}>
        <Seal ok />
        <div>
          <span className="tag">Verified authentic</span>
          <h1 className="d d-lg">{product.name}</h1>
          <p className="mono muted" style={{ overflowWrap: "anywhere" }}>
            {product.tokenId}
          </p>
        </div>
        <div className="verdict-side">
          <span className="tag dim">{statusLabel(product.status)}</span>
        </div>
      </motion.div>

      <div className="work" style={{ gridTemplateColumns: "0.85fr 1.15fr" }}>
        <div className="stack">
          <motion.div className="card" {...rise(0.12)}>
            <div className="card-label">
              <Fingerprint size={18} /> Identifiers
            </div>
            <dl style={{ margin: 0 }}>
              {rows.map(([k, v]) => (
                <div className="kv-row" key={k}>
                  <dt>{k}</dt>
                  <dd className="mono">{v}</dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div className="card" {...rise(0.2)}>
            <div className="card-label">
              <KeyRound size={18} /> Ownership
            </div>
            <p className="muted" style={{ fontSize: "0.88rem", marginBottom: 20 }}>
              Connect your wallet to confirm whether you're the registered owner of this item.
            </p>
            <button className="btn btn-block" onClick={() => void proveOwnership()} disabled={checking}>
              {account ? <KeyRound size={17} /> : <Wallet size={17} />}
              {checking ? "Checking…" : account ? `Verify as ${short(account)}` : "Connect wallet"}
            </button>
            {owned !== null && (
              <div style={{ marginTop: 16, textAlign: "center" }}>
                <span className={`tag${owned ? "" : " red"}`}>{owned ? "You own this" : "Not your item"}</span>
              </div>
            )}
          </motion.div>
        </div>

        <div className="stack">
          <motion.div className="card" {...rise(0.16)}>
            <div className="card-label">
              <History size={18} /> Provenance · {events.length} event{events.length === 1 ? "" : "s"}
            </div>

            <div className="sum" style={{ marginBottom: 28 }}>
              <span className="rl">Stage</span>
              {STAGES.map((s) => (
                <span key={s.key} className="cl" style={{ ["--c" as string]: s.color }}>
                  {s.label}
                </span>
              ))}
              <span className="rl">Events</span>
              {counts.map((n, i) => (
                <span key={i} className="cv">
                  {n}
                </span>
              ))}
            </div>

            {events.length === 0 ? (
              <div className="empty">
                <ScanLine size={32} />
                No events recorded yet.
              </div>
            ) : (
              <Timeline events={events} />
            )}
          </motion.div>

          <motion.div className="card" {...rise(0.28)}>
            <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
              <div className="qr-frame" style={{ padding: 10, borderRadius: 16, boxShadow: "none" }}>
                <QRCodeSVG value={link} size={86} bgColor="#e8f2f1" fgColor="#031010" />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <b className="d d-sm" style={{ display: "block" }}>
                  Share this record
                </b>
                <p className="muted" style={{ fontSize: "0.85rem", margin: "4px 0 14px" }}>
                  Anyone with this link can verify the product.
                </p>
                <button
                  className="btn btn-sm"
                  onClick={() => navigator.clipboard.writeText(link).then(() => toast("Link copied.", "ok"))}
                >
                  <Copy size={14} /> Copy link
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

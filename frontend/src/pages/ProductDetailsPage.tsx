import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Boxes, Copy, Fingerprint, History, KeyRound, PackageOpen, RotateCcw, ScanLine, ShoppingBag, Sparkles, Truck, Wallet, type LucideIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { apiGet, apiPost } from "@/api/client";
import { Seal } from "@/components/Seal";
import { Timeline } from "@/components/Timeline";
import { useToast } from "@/context/ToastContext";
import { useWallet } from "@/context/WalletContext";
import { bizKey, short, statusLabel } from "@/lib/format";
import { isDemoToken, resetDemoToken } from "@/lib/mockApi";
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

const DEMO_WALLET = "0xDe70a11ce0000000000000000000000000000001";

const journey: Record<string, { next: string; label: string; icon: LucideIcon; actor: string; readPoint: string } | undefined> = {
  commissioning: { next: "shipping", label: "Ship it", icon: Truck, actor: "logistics-partner-01", readPoint: "urn:epc:id:sgln:1234567.0000.1" },
  shipping: { next: "receiving", label: "Receive it", icon: PackageOpen, actor: "retailer-nyc", readPoint: "urn:epc:id:sgln:7654321.0000.2" },
  receiving: { next: "storing", label: "Shelve it", icon: Boxes, actor: "retailer-nyc", readPoint: "urn:epc:id:sgln:7654321.0000.3" },
  storing: { next: "selling", label: "Sell it", icon: ShoppingBag, actor: "retailer-nyc", readPoint: "urn:epc:id:sgln:7654321.0000.3" },
};

export default function ProductDetailsPage() {
  const { id = "" } = useParams();
  const toast = useToast();
  const { account, connectWallet, sign } = useWallet();
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [checking, setChecking] = useState(false);
  const [owned, setOwned] = useState<boolean | null>(null);

  const [stepping, setStepping] = useState(false);

  const fetchRecord = useCallback(
    () =>
      apiGet<ProductRecord>(`/api/metadata/${encodeURIComponent(id)}`)
        .then((data) => {
          remember(data.product.tokenId);
          setLoad({ state: "ok", data });
        })
        .catch((e: Error) =>
          setLoad(/not found/i.test(e.message) ? { state: "missing" } : { state: "error", message: e.message }),
        ),
    [id],
  );

  useEffect(() => {
    setLoad({ state: "loading" });
    setOwned(null);
    void fetchRecord();
  }, [fetchRecord]);

  async function advance(step: NonNullable<(typeof journey)[string]>) {
    setStepping(true);
    try {
      await apiPost("/api/events", {
        tokenId: id,
        bizStep: `urn:epcglobal:cbv:bizstep:${step.next}`,
        readPoint: step.readPoint,
        actor: step.actor,
      });
      await fetchRecord();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Step failed", "err");
    } finally {
      setStepping(false);
    }
  }

  async function restart() {
    resetDemoToken();
    setOwned(null);
    await fetchRecord();
  }

  async function proveOwnership() {
    const demoItem = isDemoToken(id);
    if (!account && !demoItem) return connectWallet();
    setChecking(true);
    try {
      const owner = account ?? DEMO_WALLET;
      const { message } = await apiPost<{ message: string }>("/api/verify/challenge", { tokenId: id });
      // the demo has no real wallet, so there is nothing to sign
      const signature = demoItem && !account ? "demo" : await sign(message);
      if (!signature) return;
      const res = await apiPost<{ verified: boolean; reason?: string }>("/api/verify/ownership", {
        tokenId: id,
        owner,
        message,
        signature,
      });
      setOwned(res.verified);
      toast(
        res.verified ? "Ownership confirmed for this wallet." : (res.reason ?? "This wallet does not own the product."),
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
  const demoItem = isDemoToken(product.tokenId);
  const lastKey = events.length ? bizKey(events[events.length - 1].bizStep) : "commissioning";
  const nextStep = journey[lastKey];
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
          {demoItem && (
            <motion.div className="card" {...rise(0.08)}>
              <div className="card-label">
                <Sparkles size={18} /> Demo journey
              </div>
              <p className="muted" style={{ fontSize: "0.88rem", marginBottom: 18 }}>
                {nextStep
                  ? "Walk this item from factory to shopper. Each click records a real EPCIS event and updates the provenance trail."
                  : "The item has been sold. Check ownership below, or replay the journey."}
              </p>
              {nextStep && (
                <button className="btn btn-block" disabled={stepping} onClick={() => void advance(nextStep)}>
                  {stepping ? <span className="spinner" /> : <nextStep.icon size={17} />} {nextStep.label}
                </button>
              )}
              <button className="btn btn-sm" style={{ marginTop: nextStep ? 12 : 0 }} onClick={() => void restart()}>
                <RotateCcw size={14} /> Restart journey
              </button>
            </motion.div>
          )}

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
              {demoItem
                ? "No wallet needed in the demo. A sample wallet is used to confirm ownership."
                : "Connect your wallet to confirm whether you're the registered owner of this item."}
            </p>
            <button className="btn btn-block" onClick={() => void proveOwnership()} disabled={checking}>
              {account || demoItem ? <KeyRound size={17} /> : <Wallet size={17} />}
              {checking ? "Checking…" : account ? `Verify as ${short(account)}` : demoItem ? "Verify ownership" : "Connect wallet"}
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

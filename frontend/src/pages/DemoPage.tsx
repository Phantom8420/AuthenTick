import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Boxes, Check, Factory, PackageOpen, Play, RotateCcw, ShieldCheck, Sparkles, Truck, X, type LucideIcon } from "lucide-react";
import { apiGet, apiPost } from "@/api/client";
import { useDemo } from "@/context/DemoContext";
import { useToast } from "@/context/ToastContext";
import { randomToken } from "@/lib/format";
import { remember, type ProductRecord } from "@/lib/registry";
import type { ChainEvent } from "@/components/Timeline";

type Status = "idle" | "running" | "done" | "error";
type Step = { key: string; title: string; text: string; icon: LucideIcon };

const steps: Step[] = [
  { key: "mint", title: "Mint the digital twin", text: "Manufacturer registers the product and its commissioning event is created.", icon: Factory },
  { key: "ship", title: "Ship it", text: "Distributor records a GS1 EPCIS shipping event.", icon: Truck },
  { key: "receive", title: "Receive it", text: "The next stop logs receiving at its own read point.", icon: PackageOpen },
  { key: "store", title: "Shelve it", text: "Retailer stores the item. It's now ready for sale.", icon: Boxes },
  { key: "verify", title: "Verify authenticity", text: "A shopper's scan pulls the record and checks the full history.", icon: ShieldCheck },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const biz = (k: string) => `urn:epcglobal:cbv:bizstep:${k}`;

export default function DemoPage() {
  const { demo, setDemo } = useDemo();
  const toast = useToast();
  const [token, setToken] = useState(() => randomToken());
  const [status, setStatus] = useState<Status[]>(steps.map(() => "idle"));
  const [detail, setDetail] = useState<string[]>(steps.map(() => ""));
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const busy = useRef(false);

  const mark = (i: number, s: Status, d?: string) => {
    setStatus((a) => a.map((v, k) => (k === i ? s : v)));
    if (d !== undefined) setDetail((a) => a.map((v, k) => (k === i ? d : v)));
  };

  async function run() {
    if (busy.current) return;
    busy.current = true;
    setRunning(true);
    setFinished(false);
    const id = finished ? randomToken() : token;
    setToken(id);
    setStatus(steps.map(() => "idle"));
    setDetail(steps.map(() => ""));

    const act = [
      async () => {
        await apiPost("/api/products", {
          tokenId: id,
          name: "Demo Chronograph",
          gtin: "04012345678901",
          serial: `SN-${id.slice(-4).toUpperCase()}`,
          batchId: "BATCH-DEMO",
          manufacturerId: "manufacturer-demo",
        });
        return "Twin minted · commissioning event recorded";
      },
      async () => {
        await apiPost("/api/events", { tokenId: id, bizStep: biz("shipping"), readPoint: "urn:epc:id:sgln:1234567.0000.1", actor: "logistics-partner-01" });
        return "shipping @ sgln:1234567.0000.1";
      },
      async () => {
        await apiPost("/api/events", { tokenId: id, bizStep: biz("receiving"), readPoint: "urn:epc:id:sgln:7654321.0000.2", actor: "retailer-nyc" });
        return "receiving @ sgln:7654321.0000.2";
      },
      async () => {
        await apiPost("/api/events", { tokenId: id, bizStep: biz("storing"), readPoint: "urn:epc:id:sgln:7654321.0000.3", actor: "retailer-nyc" });
        return "storing @ sgln:7654321.0000.3";
      },
      async () => {
        const rec = await apiGet<ProductRecord>(`/api/metadata/${encodeURIComponent(id)}`);
        const evs: ChainEvent[] = rec.events;
        return `Authentic · ${evs.length} events on record`;
      },
    ];

    let cur = 0;
    try {
      for (let i = 0; i < act.length; i++) {
        cur = i;
        mark(i, "running");
        await sleep(550);
        const d = await act[i]();
        mark(i, "done", d);
        await sleep(350);
      }
      remember(id);
      setFinished(true);
      toast("Demo complete. The product is verified.", "ok");
    } catch (e) {
      mark(cur, "error", e instanceof Error ? e.message : "Failed");
      toast(e instanceof Error ? e.message : "Demo failed", "err");
    } finally {
      busy.current = false;
      setRunning(false);
    }
  }

  return (
    <>
      <div className="page-head">
        <span className="kicker">Interactive demo</span>
        <h1 className="d d-xl">
          Run the whole <span className="outline">process.</span>
        </h1>
        <p className="muted">
          One click mints a mock token and walks it from factory to shelf, then verifies it, using the same
          screens and calls as the real app.
        </p>
      </div>

      <div className="work">
        <div className="card">
          <div className="card-label">
            <Sparkles size={18} /> Lifecycle
          </div>

          <ol className="demo-steps">
            {steps.map((s, i) => {
              const st = status[i];
              const Icon = s.icon;
              return (
                <motion.li key={s.key} className={`demo-step ${st}`} layout>
                  <span className="demo-dot">
                    {st === "done" ? <Check size={16} /> : st === "error" ? <X size={16} /> : st === "running" ? <span className="spinner" /> : <Icon size={16} />}
                  </span>
                  <div>
                    <b>{s.title}</b>
                    <p>{s.text}</p>
                    {detail[i] && <span className="mono demo-detail">{detail[i]}</span>}
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>

        <div className="stack">
          <div className="card">
            <div className="card-label">Mock token</div>
            <div className="token-pill mono" style={{ marginBottom: 18 }}>
              <span>{token}</span>
            </div>

            <button className="btn btn-block" onClick={() => void run()} disabled={running}>
              {running ? (
                <>
                  <span className="spinner" /> Running…
                </>
              ) : finished ? (
                <>
                  <RotateCcw size={17} /> Run again
                </>
              ) : (
                <>
                  <Play size={17} /> Run full demo
                </>
              )}
            </button>

            {finished && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 14 }}>
                <Link to={`/product/${encodeURIComponent(token)}`} className="btn btn-block">
                  Open verified record <ArrowUpRight size={16} />
                </Link>
              </motion.div>
            )}
          </div>

          <div className="card">
            <div className="card-label">Data source</div>
            <p className="muted" style={{ fontSize: "0.85rem", marginBottom: 16 }}>
              {demo
                ? "Demo mode is on. Everything is simulated in your browser and nothing leaves this device."
                : "Demo mode is off. The run uses the live API."}
            </p>
            <button className="btn btn-sm" onClick={() => setDemo(!demo)} disabled={running}>
              {demo ? "Switch to live API" : "Switch to demo mode"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

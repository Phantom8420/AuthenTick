import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { IsoBox, IsoKey, IsoScan, IsoShield } from "@/components/IsoIcons";
import { MetalPanel } from "@/components/MetalPanel";
import { useCarousel } from "@/lib/useCarousel";
import { STAGES, countStages, useRecent } from "@/lib/registry";
import { statusLabel } from "@/lib/format";

const ease = [0.22, 1, 0.36, 1] as const;
const inView = {
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-70px" },
  transition: { duration: 0.75, ease },
};

/* ───────────── hero ───────────── */

const nodes: Array<{ x: number; y: number; label: ReactNode; icon: ReactNode }> = [
  { x: 84, y: 27, label: <>Digital twin<br />minting</>, icon: <IsoShield /> },
  { x: 14, y: 67, label: <>EPCIS event<br />tracking</>, icon: <IsoBox /> },
  { x: 50, y: 80, label: <>Scan &amp; instant<br />verification</>, icon: <IsoScan /> },
  { x: 86, y: 74, label: <>Private ownership<br />proofs</>, icon: <IsoKey /> },
];

const loops = [
  "M505,350 C380,350 250,390 195,440",
  "M215,482 C330,420 440,590 545,560",
  "M655,556 C780,510 900,612 985,534",
  "M1062,482 C1132,400 1112,300 1042,232",
  "M965,186 C880,200 780,300 705,340",
];

function Hero() {
  const lines = ["Securing every product", "for an authentic"];
  return (
    <section className="hero">
      <div className="scene">
        <svg className="paths" viewBox="0 0 1200 700" preserveAspectRatio="none" fill="none" aria-hidden>
          {loops.map((d, i) => (
            <g key={i}>
              <path id={`loop${i}`} className="dash" d={d} />
              <path d="M0,0 L-11,-5.500 L-7.500,0 L-11,5.500 Z" fill="#cfe3e2" opacity=".75">
                <animateMotion dur="7s" begin={`${i * 1.4}s`} repeatCount="indefinite" rotate="auto">
                  <mpath href={`#loop${i}`} />
                </animateMotion>
              </path>
            </g>
          ))}
        </svg>

        <div className="scene-copy">
          <h1 className="d d-xl">
            {lines.map((l, i) => (
              <motion.span
                key={l}
                style={{ display: "block" }}
                initial={{ opacity: 0, y: 50, rotateX: -35 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease }}
              >
                {l}
              </motion.span>
            ))}
            <motion.span
              className="outline"
              style={{ display: "block" }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.34, ease }}
            >
              digital future.
            </motion.span>
          </h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8, ease }}>
            <Link to="/verify" className="btn">
              Verify a product
            </Link>
          </motion.div>
        </div>

        <div className="scene-nodes">
          {nodes.map((n, i) => (
            <motion.div
              key={i}
              className="node"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.12, duration: 0.8, ease }}
            >
              <div className="orb">{n.icon}</div>
              <span className="nlabel">{n.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── registry carousel ───────────── */

type Card = {
  key: string;
  title: string;
  year: string;
  tag: string;
  desc: string;
  counts: number[];
  to?: string;
  sample?: boolean;
  status: string;
};

const samples: Card[] = [
  { key: "s1", title: "Aurelia Chronograph", year: "2026", tag: "Sample", status: "RETAIL", counts: [1, 2, 3, 1], desc: "A serialized watch commissioned at the factory, shipped through two warehouses and shelved at a verified retailer." },
  { key: "s2", title: "Nocturne Satchel", year: "2026", tag: "Sample", status: "IN_TRANSIT", counts: [1, 1, 0, 0], desc: "A leather bag mid-journey. Its digital twin already carries the commissioning and first shipping event." },
  { key: "s3", title: "Halden Sneaker", year: "2025", tag: "Sample", status: "SOLD", counts: [1, 2, 2, 2], desc: "A limited-run sneaker that changed hands at retail. Ownership moved on-chain and the history is sealed." },
];

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "IN_TRANSIT", label: "In transit" },
  { key: "RETAIL", label: "Retail" },
  { key: "SOLD", label: "Sold" },
];

function WorkCard({ c }: { c: Card }) {
  const total = c.counts.reduce((a, b) => a + b, 0);
  return (
    <article className="card work-card">
      <div className="work-top">
        <h3 className="work-title">
          {c.title}
          <span>/{c.year}</span>
        </h3>
        <span className={`tag${c.sample ? " dim" : ""}`}>{c.sample ? c.tag : statusLabel(c.status)}</span>
      </div>
      <p className="work-desc">{c.desc}</p>

      <div className="sum-label">Provenance summary:</div>
      <div className="sum">
        <span className="rl">Stage</span>
        {STAGES.map((s) => (
          <span key={s.key} className="cl" style={{ ["--c" as string]: s.color }}>
            {s.label}
          </span>
        ))}
        <span className="rl">Events</span>
        {c.counts.map((n, i) => (
          <span key={i} className="cv">
            {n}
          </span>
        ))}
      </div>

      <div className="work-foot">
        <div className="total">
          Total events: <b>{total}</b>
        </div>
        {c.to ? (
          <Link to={c.to} className="btn btn-sm">
            View full record <ArrowUpRight size={16} />
          </Link>
        ) : (
          <Link to="/manufacturer" className="btn btn-sm">
            Mint yours <ArrowUpRight size={16} />
          </Link>
        )}
      </div>
    </article>
  );
}

function Registry() {
  const records = useRecent();
  const [filter, setFilter] = useState("ALL");

  const cards = useMemo<Card[]>(() => {
    if (records === null) return [];
    if (records.length === 0) return samples;
    return records.map(({ product: p, events }) => ({
      key: p.tokenId,
      title: p.name,
      year: String(new Date(events[0]?.eventTime ?? Date.now()).getFullYear()),
      tag: statusLabel(p.status),
      status: p.status ?? "PRODUCTION",
      counts: countStages(events),
      to: `/product/${encodeURIComponent(p.tokenId)}`,
      desc: `GTIN ${p.gtin} · serial ${p.serial}${p.batchId ? ` · batch ${p.batchId}` : ""}. Every handoff is recorded as a GS1 EPCIS event on its digital twin.`,
    }));
  }, [records]);

  const shown = cards.filter((c) => filter === "ALL" || c.status === filter);
  const { ref, edge, prev, next } = useCarousel<HTMLDivElement>([shown.length]);

  return (
    <section className="section" id="registry">
      <motion.div className="section-head center" {...inView}>
        <h2 className="d d-lg">Past work</h2>
      </motion.div>

      <motion.div className="tabs" {...inView}>
        {FILTERS.map((f) => (
          <button key={f.key} className={`tab${filter === f.key ? " on" : ""}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </motion.div>

      <motion.div className="carousel" {...inView}>
        <div className="nav-arrow l">
          <button className="round" onClick={prev} disabled={edge.start} aria-label="Previous">
            <ChevronLeft size={22} />
          </button>
        </div>
        <div className="track" ref={ref}>
          <AnimatePresence initial={false}>
            {shown.map((c) => (
              <WorkCard key={c.key} c={c} />
            ))}
          </AnimatePresence>
          {records !== null && shown.length === 0 && (
            <div className="card work-card" style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <p className="muted">Nothing in this view yet.</p>
            </div>
          )}
        </div>
        <div className="nav-arrow r">
          <button className="round" onClick={next} disabled={edge.end} aria-label="Next">
            <ChevronRight size={22} />
          </button>
        </div>
      </motion.div>
    </section>
  );
}

/* ───────────── articles ───────────── */

const posts = [
  { tag: "Protocol", title: "How a digital twin makes a counterfeit worthless", text: "One serial, one token, one record. Why a copied label can't carry a forged history.", read: "3 min read", to: "/manufacturer" },
  { tag: "Supply chain", title: "Recording EPCIS events without the paperwork", text: "Shipping, receiving and storing as standard GS1 events, in a couple of taps.", read: "4 min read", to: "/supply-chain" },
  { tag: "Consumers", title: "Scan it. See the history. Know it's real.", text: "What a shopper sees in a second, from factory floor to shelf.", read: "2 min read", to: "/verify" },
  { tag: "Privacy", title: "Proving you own it without saying who you are", text: "Zero-knowledge ownership checks and why they matter for resale.", read: "5 min read", to: "/verify" },
  { tag: "Standards", title: "GTINs, GLNs and why GS1 keeps partners aligned", text: "The identifiers that let every system in the chain speak the same language.", read: "3 min read", to: "/supply-chain" },
];

function Articles() {
  const { ref, edge, prev, next } = useCarousel<HTMLDivElement>();
  return (
    <section className="section">
      <motion.div className="section-head" {...inView}>
        <h2 className="d d-lg" style={{ textTransform: "none", fontStyle: "italic" }}>
          The latest from AuthenTick
        </h2>
        <Link to="/verify" className="btn btn-sm">
          Discover more
        </Link>
      </motion.div>

      <motion.div {...inView}>
        <div className="track" ref={ref}>
          {posts.map((p, i) => (
            <Link to={p.to} key={p.title} className="card post">
              <div className="img">
                <MetalPanel v={i} />
              </div>
              <div className="post-body">
                <span className="chip">{p.tag}</span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
                <div className="post-foot">
                  <span>{p.read}</span>
                  <span className="round" aria-hidden>
                    <ArrowUpRight size={16} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="slider-ctl">
          <button className="round sm" onClick={prev} disabled={edge.start} aria-label="Previous">
            <ChevronLeft size={18} />
          </button>
          <button className="round sm" onClick={next} disabled={edge.end} aria-label="Next">
            <ChevronRight size={18} />
          </button>
        </div>
      </motion.div>
    </section>
  );
}

/* ───────────── story ───────────── */

const steps = [
  { label: "Mint", title: "We start with a twin", text: "The manufacturer registers each serialized item and mints its digital twin, bound to a GTIN and serial number. A commissioning event seals the first entry in its history.", to: "/manufacturer", cta: "Mint a twin" },
  { label: "Ship", title: "Every handoff recorded", text: "Distributors log shipping and receiving as GS1 EPCIS events. Each one extends the product's trail, and none of them can be rewritten.", to: "/supply-chain", cta: "Record an event" },
  { label: "Shelve", title: "Custody becomes ownership", text: "Retailers store and sell. High-frequency events stay off-chain for speed, while ownership transfers settle on-chain for finality.", to: "/supply-chain", cta: "Track a shipment" },
  { label: "Verify", title: "One scan tells the truth", text: "Shoppers scan the QR code and instantly see whether the product is registered, who made it and everywhere it has been.", to: "/verify", cta: "Scan a product" },
];

function Story() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % steps.length), 6000);
    return () => clearInterval(t);
  }, [paused]);

  const s = steps[i];
  return (
    <motion.section className="section" {...inView}>
      <div className="sheet story" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div>
          <span className="kicker">Our process</span>
          <h2 className="d d-xl">
            How it all
            <br />
            works
          </h2>

          <div className="timeline-bar">
            <div className="rail" />
            <motion.div
              className="fill"
              animate={{ width: `${((i + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.8, ease }}
            />
            <div className="tl-stops">
              {steps.map((st, idx) => (
                <button key={st.label} className={`tl-stop${idx === i ? " on" : ""}`} onClick={() => setI(idx)}>
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="story-right">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease }}
            >
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <Link to={s.to} className="btn btn-sm link">
                {s.cta} <ArrowRight size={16} />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Registry />
      <Articles />
      <Story />
    </>
  );
}

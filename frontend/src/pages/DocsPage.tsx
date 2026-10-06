import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Code2, Compass, Sparkles, Terminal } from "lucide-react";
import { DEMO_TOKEN } from "@/lib/mockApi";
import { REPO_URL, repoLink } from "@/lib/links";

const api: Array<[string, string, string]> = [
  ["POST", "/api/products", "Mint a digital twin and record its commissioning event"],
  ["GET", "/api/metadata/:tokenId", "Product details plus its full event history"],
  ["POST", "/api/events", "Record a GS1 EPCIS event: shipping, receiving, storing, selling"],
  ["GET", "/api/events/product/:tokenId", "Event history for one product"],
  ["POST", "/api/verify/challenge", "Get a message for a wallet to sign as proof of ownership"],
  ["POST", "/api/verify/ownership", "Check a signed proof that a wallet owns a product"],
  ["GET", "/api/auth/challenge", "Get a message to sign in with a wallet"],
  ["POST", "/api/auth/login", "Exchange the signed message for a 12 hour token"],
];

const lifecycle = [
  ["Mint", "A manufacturer registers a serialized product (GTIN + serial). It becomes a digital twin with a printable QR code."],
  ["Hand off", "Distributors and retailers log shipping, receiving and storing as GS1 EPCIS events."],
  ["Verify", "A shopper scans the QR code or searches the token ID and sees the full provenance trail."],
  ["Own", "The buyer connects a wallet to confirm they are the registered owner."],
];

const rise = (d = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: d, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
});

const Ext = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a className="btn btn-sm" href={href} target="_blank" rel="noopener noreferrer">
    {children} <ArrowUpRight size={14} />
  </a>
);

export default function DocsPage() {
  return (
    <>
      <div className="page-head">
        <span className="kicker">Documentation</span>
        <h1 className="d d-xl">
          How it <span className="outline">works.</span>
        </h1>
        <p className="muted">
          AuthenTick gives every physical product a tamper-proof digital twin, tracks each handoff on
          the way to the shelf, and lets anyone check it's real. Full source and guides live on GitHub.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Ext href={REPO_URL}>View on GitHub</Ext>
          <Ext href={repoLink("blob/main/README.md")}>README</Ext>
          <Ext href={repoLink("blob/main/docs/ARCHITECTURE.md")}>Architecture</Ext>
          <Ext href={repoLink("issues")}>Report an issue</Ext>
        </div>
      </div>

      <div className="work">
        <motion.div className="card" {...rise(0.05)}>
          <div className="card-label">
            <Compass size={18} /> The lifecycle
          </div>
          <ol className="demo-steps">
            {lifecycle.map(([t, d], i) => (
              <li key={t} className="demo-step">
                <span className="demo-dot">{i + 1}</span>
                <div>
                  <b>{t}</b>
                  <p>{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </motion.div>

        <div className="stack">
          <motion.div className="card" {...rise(0.1)}>
            <div className="card-label">
              <Sparkles size={18} /> Try it in a minute
            </div>
            <p className="muted" style={{ fontSize: "0.88rem", marginBottom: 14 }}>
              No backend or wallet needed. Paste the demo token into the search bar on the Verify page,
              then step the item from factory to shopper.
            </p>
            <div className="token-pill mono" style={{ marginBottom: 16 }}>
              <span>{DEMO_TOKEN}</span>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link to="/verify" className="btn btn-sm">
                Open Verify
              </Link>
              <Link to="/demo" className="btn btn-sm">
                Run the guided demo
              </Link>
            </div>
          </motion.div>

          <motion.div className="card" {...rise(0.15)}>
            <div className="card-label">
              <Terminal size={18} /> Run it locally
            </div>
            <pre className="mono" style={{ margin: 0, overflowX: "auto", fontSize: "0.82rem", color: "var(--dim)" }}>
              {`git clone ${REPO_URL}.git
cd AuthenTick
npm install
npm run dev`}
            </pre>
            <p className="muted" style={{ fontSize: "0.82rem", marginTop: 12 }}>
              The web app opens on port 5173 and the API on 4000. Setup details are in the{" "}
              <a href={repoLink("blob/main/README.md")} target="_blank" rel="noopener noreferrer">
                README
              </a>
              .
            </p>
          </motion.div>
        </div>
      </div>

      <motion.div className="card" style={{ marginTop: 22 }} {...rise(0.2)}>
        <div className="card-label">
          <Code2 size={18} /> API reference
        </div>
        <dl style={{ margin: 0 }}>
          {api.map(([method, path, text]) => (
            <div className="kv-row" key={path}>
              <dt className="mono">
                <span className="tag dim" style={{ marginRight: 10 }}>
                  {method}
                </span>
                {path}
              </dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
        <p className="muted" style={{ fontSize: "0.82rem", marginTop: 16 }}>
          <BookOpen size={13} style={{ verticalAlign: "-2px" }} /> Source for every route is in{" "}
          <a href={repoLink("tree/main/backend/src/routes")} target="_blank" rel="noopener noreferrer">
            backend/src/routes
          </a>
          .
        </p>
      </motion.div>
    </>
  );
}

import { useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Wallet } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { useDemo } from "@/context/DemoContext";
import { Logo } from "@/components/Logo";
import { short } from "@/lib/format";
import { REPO_URL } from "@/lib/links";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/verify", label: "Verify" },
  { to: "/manufacturer", label: "Manufacturer" },
  { to: "/supply-chain", label: "Supply chain" },
  { to: "/demo", label: "Demo" },
  { to: "/docs", label: "Docs" },
];

export function Layout() {
  const { account, connectWallet, disconnect } = useWallet();
  const { demo, setDemo } = useDemo();
  const { pathname } = useLocation();

  // feed the card hover glow
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(".card");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="backdrop" aria-hidden />

      <div className="nav-wrap">
        <nav className="nav" aria-label="Main">
          <Link to="/" className="brand" aria-label="AuthenTick home">
            <Logo />
            AuthenTick
          </Link>

          <div className="nav-links">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
                {l.label}
              </NavLink>
            ))}
          </div>

          <div className="nav-end">
            <button
              className={`demo-toggle${demo ? " on" : ""}`}
              onClick={() => setDemo(!demo)}
              aria-pressed={demo}
              title={demo ? "Demo mode: simulated in your browser. Click to use the live API." : "Click to run everything on mock data"}
            >
              <i />
              Demo
            </button>
            {account ? (
              <button className="pill-link" onClick={disconnect} title="Disconnect wallet">
                <span className="ico">
                  <LogOut size={14} />
                </span>
                {short(account)}
              </button>
            ) : (
              <button className="pill-link" onClick={() => void connectWallet()}>
                <span className="ico">
                  <Wallet size={14} />
                </span>
                Connect
              </button>
            )}
          </div>
        </nav>
      </div>

      <main className="main" id="main" tabIndex={-1}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="footer">
        <span>© AuthenTick — immutable provenance for physical goods.</span>
        <span>
          <Link to="/docs">Docs</Link> ·{" "}
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>{" "}
          · ERC-721 · GS1 EPCIS
        </span>
      </footer>
    </div>
  );
}

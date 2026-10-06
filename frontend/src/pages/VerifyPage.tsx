import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { motion } from "framer-motion";
import { CameraOff, Search } from "lucide-react";
import { tokenFromScan } from "@/lib/format";

const READER_ID = "qr-reader";

export default function VerifyPage() {
  const navigate = useNavigate();
  const [camError, setCamError] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [manual, setManual] = useState("");

  useEffect(() => {
    let cancelled = false;
    let started = false;
    const scanner = new Html5Qrcode(READER_ID, false);

    const halt = () =>
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {});

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 260 }, aspectRatio: 1 },
        (text) => {
          if (cancelled) return;
          cancelled = true;
          navigate(`/product/${encodeURIComponent(tokenFromScan(text))}`);
        },
        () => {},
      )
      .then(() => {
        started = true;
        if (cancelled) void halt();
        else setLive(true);
      })
      .catch((e) => {
        if (!cancelled) setCamError(typeof e === "string" ? e : (e as Error)?.message || "Camera unavailable");
      });

    return () => {
      cancelled = true;
      if (started) void halt();
    };
  }, [navigate]);

  function lookup(e: FormEvent) {
    e.preventDefault();
    const id = tokenFromScan(manual);
    if (id) navigate(`/product/${encodeURIComponent(id)}`);
  }

  return (
    <div className="verify-grid" style={{ marginTop: 30 }}>
      <div className="page-head" style={{ margin: 0, gap: 26 }}>
        <span className="kicker">Consumer verification</span>
        <h1 className="d d-xl">
          Is it
          <br />
          <span className="outline">real?</span>
        </h1>
        <p className="muted">
          Hold the product's QR code inside the frame. We'll pull its on-chain identity and complete
          supply-chain history in an instant.
        </p>

        <div className="divider">or enter an ID</div>

        <form onSubmit={lookup} className="input-row">
          <input
            className="input mono"
            placeholder="Token ID or product link"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            aria-label="Token ID"
            style={{ borderRadius: 999, height: 54 }}
          />
          <button className="round" disabled={!manual.trim()} aria-label="Look up">
            <Search size={20} />
          </button>
        </form>
      </div>

      <motion.div
        className="scanner"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div id={READER_ID} />

        {!live && (
          <div className="scan-msg">
            {camError ? (
              <>
                <CameraOff size={34} color="#d9736e" />
                <span>Camera isn't available here.</span>
                <span style={{ color: "var(--faint)" }}>
                  Allow camera access, or look the product up with its ID instead.
                </span>
              </>
            ) : (
              <>
                <span className="spinner" />
                <span>Starting camera…</span>
              </>
            )}
          </div>
        )}

        <div className="scan-ui">
          <i className="corner tl" />
          <i className="corner tr" />
          <i className="corner bl" />
          <i className="corner br" />
          {live && <div className="scan-line" />}
        </div>
      </motion.div>
    </div>
  );
}

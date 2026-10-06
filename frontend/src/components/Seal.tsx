import { motion } from "framer-motion";

/** Verdict seal: ring draws in, then the mark. `ok` = check, otherwise cross. */
export function Seal({ ok }: { ok: boolean }) {
  const c = ok ? "#2fa86a" : "#c4413c";
  return (
    <svg className="seal" viewBox="0 0 124 124" fill="none" aria-hidden>
      <motion.circle
        cx="62"
        cy="62"
        r="57"
        stroke={c}
        strokeOpacity=".18"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
      <motion.circle
        cx="62"
        cy="62"
        r="46"
        stroke={c}
        strokeWidth="3"
        strokeLinecap="round"
        style={{ rotate: -90, transformOrigin: "62px 62px", filter: `drop-shadow(0 0 8px ${c}99)` }}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.circle
        cx="62"
        cy="62"
        r="36"
        fill={c}
        fillOpacity=".1"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 18 }}
        style={{ transformOrigin: "62px 62px" }}
      />
      <motion.path
        d={ok ? "m44 63 12 12 25-27" : "m47 47 30 30M77 47 47 77"}
        stroke={c}
        strokeWidth="5.500"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.75, duration: 0.5, ease: "easeOut" }}
      />
    </svg>
  );
}

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

type Kind = "ok" | "err" | "info";
type Toast = { id: number; kind: Kind; text: string };

const ToastContext = createContext<(text: string, kind?: Kind) => void>(() => {});

const icon = { ok: CheckCircle2, err: AlertTriangle, info: Info };
const color = { ok: "var(--g-green)", err: "#d9736e", info: "var(--teal)" };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((text: string, kind: Kind = "info") => {
    const id = Date.now() + Math.random();
    setItems((t) => [...t, { id, kind, text }]);
    setTimeout(() => setItems((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" aria-live="polite">
        <AnimatePresence>
          {items.map((t) => {
            const I = icon[t.kind];
            return (
              <motion.div
                key={t.id}
                className={`toast ${t.kind}`}
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              >
                <I size={18} color={color[t.kind]} style={{ flex: "none" }} />
                {t.text}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

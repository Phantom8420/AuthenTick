import { motion } from "framer-motion";
import { Boxes, PackageCheck, PackageOpen, ShoppingBag, Sparkles, Truck, type LucideIcon } from "lucide-react";
import { bizKey, bizLabel } from "@/lib/format";

export type ChainEvent = {
  bizStep: string;
  readPoint: string;
  actor?: string;
  eventTime: string;
};

const icons: Record<string, LucideIcon> = {
  commissioning: Sparkles,
  shipping: Truck,
  receiving: PackageOpen,
  storing: Boxes,
  selling: ShoppingBag,
};

export function Timeline({ events }: { events: ChainEvent[] }) {
  return (
    <ol className="timeline">
      {events.map((e, i) => {
        const Icon = icons[bizKey(e.bizStep)] ?? PackageCheck;
        const latest = i === events.length - 1;
        return (
          <motion.li
            key={`${e.eventTime}-${i}`}
            className={`tl-item${latest ? " latest" : ""}`}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="tl-dot">
              <Icon size={16} color={latest ? "var(--teal)" : "var(--dim)"} />
            </span>
            <div className="tl-body">
              <b>{bizLabel(e.bizStep)}</b>
              <small>
                {new Date(e.eventTime).toLocaleString()}
                {e.actor ? ` · ${e.actor}` : ""}
              </small>
              <span className="mono">{e.readPoint}</span>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

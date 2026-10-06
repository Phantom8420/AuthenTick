import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { demoActive, disableDemo, enableDemo } from "@/lib/mockApi";
import { useToast } from "@/context/ToastContext";

type DemoValue = { demo: boolean; setDemo: (on: boolean) => void };

const DemoContext = createContext<DemoValue>({ demo: false, setDemo: () => {} });

export function DemoProvider({ children }: { children: ReactNode }) {
  const [demo, setState] = useState(demoActive());
  const toast = useToast();

  useEffect(() => {
    const onChange = (e: Event) => {
      const on = demoActive();
      setState(on);
      if ((e as CustomEvent).detail?.auto && on) {
        const reason = (e as CustomEvent).detail?.reason;
        toast(
          reason === "token"
            ? "Demo token recognised. Demo mode is on and everything runs in your browser."
            : "No backend reachable, so demo mode is on. Everything runs in your browser.",
          "info",
        );
      }
    };
    window.addEventListener("authentick:demo", onChange);
    return () => window.removeEventListener("authentick:demo", onChange);
  }, [toast]);

  const value = useMemo(
    () => ({ demo, setDemo: (on: boolean) => (on ? enableDemo() : disableDemo()) }),
    [demo],
  );
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export const useDemo = () => useContext(DemoContext);

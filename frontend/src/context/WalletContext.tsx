import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useToast } from "@/context/ToastContext";

type WalletContextValue = {
  account: string | null;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const toast = useToast();

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast("No wallet found. Install MetaMask or another EIP-1193 wallet.", "err");
      return;
    }
    try {
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      setAccount(accounts[0] ?? null);
    } catch {
      toast("Wallet connection was cancelled.", "info");
    }
  }, [toast]);

  const disconnect = useCallback(() => setAccount(null), []);

  useEffect(() => {
    const eth = window.ethereum;
    if (!eth?.on) return;
    const onChange = (accounts: string[]) => setAccount(accounts[0] ?? null);
    eth.on("accountsChanged", onChange);
    return () => eth.removeListener?.("accountsChanged", onChange);
  }, []);

  const value = useMemo(() => ({ account, connectWallet, disconnect }), [account, connectWallet, disconnect]);
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}

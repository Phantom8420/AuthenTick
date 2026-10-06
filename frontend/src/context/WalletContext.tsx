import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiGet, apiPost, logout, setAuthProvider } from "@/api/client";
import { useToast } from "@/context/ToastContext";

type WalletContextValue = {
  account: string | null;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
  /** Asks the connected wallet to sign `message` (personal_sign). Null when cancelled. */
  sign: (message: string) => Promise<string | null>;
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

  const disconnect = useCallback(() => {
    void logout();
    setAccount(null);
  }, []);

  const sign = useCallback(
    async (message: string) => {
      if (!window.ethereum) return null;
      try {
        const [from] = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
        setAccount(from ?? null);
        return (await window.ethereum.request({ method: "personal_sign", params: [message, from] })) as string;
      } catch {
        toast("Signature request was cancelled.", "info");
        return null;
      }
    },
    [toast],
  );

  // let the API client sign in with the wallet whenever a write needs it
  useEffect(() => {
    setAuthProvider(async () => {
      try {
        const { message } = await apiGet<{ message: string }>("/api/auth/challenge");
        const signature = await sign(message);
        if (!signature) return false;
        await apiPost("/api/auth/login", { message, signature });
        return true;
      } catch {
        return false;
      }
    });
    return () => setAuthProvider(null);
  }, [sign]);

  useEffect(() => {
    const eth = window.ethereum;
    if (!eth?.on) return;
    const onChange = (accounts: string[]) => {
      void logout(); // a session belongs to the wallet that signed it
      setAccount(accounts[0] ?? null);
    };
    eth.on("accountsChanged", onChange);
    return () => eth.removeListener?.("accountsChanged", onChange);
  }, []);

  const value = useMemo(() => ({ account, connectWallet, disconnect, sign }), [account, connectWallet, disconnect, sign]);
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}

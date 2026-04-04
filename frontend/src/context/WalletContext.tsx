import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Signer } from "ethers";
import { getContract } from "@/lib/blockchain";

type WalletContextValue = {
  account: string | null;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    // Create provider from window.ethereum directly 
    const { BrowserProvider } = await import("ethers");
    const provider = new BrowserProvider(window.ethereum);

    // Request accounts from the wallet
    await provider.send("eth_requestAccounts", []);

    // Get the signer address
    const signer = await provider.getSigner();
    const addr = await signer.getAddress();
    setAccount(addr);
  }, []);

  const disconnect = useCallback(() => setAccount(null), []);

  const value = useMemo(
    () => ({ account, connectWallet, disconnect }),
    [account, connectWallet, disconnect],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return ctx;
}

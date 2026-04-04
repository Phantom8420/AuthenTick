import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ethers } from "ethers";

interface WalletContextProps {
  account: string | null;
  connectWallet: () => Promise<void>;
  provider: ethers.providers.Web3Provider | null;
}

const WalletContext = createContext<WalletContextProps>({
  account: null,
  connectWallet: async () => {},
  provider: null,
});

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);

  useEffect(() => {
    if (window.ethereum) {
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(ethProvider);
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install Metamask!");
      return;
    }
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);
  };

  return (
    <WalletContext.Provider value={{ account, connectWallet, provider }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
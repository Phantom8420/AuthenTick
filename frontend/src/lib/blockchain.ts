import { BrowserProvider, Contract, type Eip1193Provider } from "ethers";
import artifact from "../../../contracts/artifacts/contracts/AuthenTickNFT.sol/AuthenTickNFT.json";

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

const { abi } = artifact as { abi: unknown };

export async function getContract(): Promise<Contract | null> {
  if (!window.ethereum) {
    alert("Install MetaMask or another EIP-1193 wallet.");
    return null;
  }

  const address = import.meta.env.VITE_NFT_CONTRACT_ADDRESS?.trim();
  if (!address) {
    console.warn("Set VITE_NFT_CONTRACT_ADDRESS to your deployed AuthenTickNFT address.");
    return null;
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new Contract(address, abi, signer);
}

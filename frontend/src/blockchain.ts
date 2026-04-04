import { ethers } from "ethers";
import AuthenTickAbi from "./abis/AuthenTick.json"; // ABI JSON from compilation

export function getContract(provider: ethers.providers.Web3Provider, signer: ethers.Signer) {
  const address = "0xYourDeployedContractAddress"; // replace with your local Hardhat deployed contract
  return new ethers.Contract(address, AuthenTickAbi, signer);
}
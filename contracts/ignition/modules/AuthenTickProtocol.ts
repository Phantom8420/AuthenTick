import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Deploys RoleManager, AuthenTickNFT, and OwnershipRegistry for local or testnet use.
 */
export default buildModule("AuthenTickProtocol", (m) => {
  const deployer = m.getAccount(0);

  const roleManager = m.contract("RoleManager", [deployer]);
  const nft = m.contract("AuthenTickNFT");
  const ownershipRegistry = m.contract("OwnershipRegistry", [deployer]);

  return { roleManager, nft, ownershipRegistry };
});

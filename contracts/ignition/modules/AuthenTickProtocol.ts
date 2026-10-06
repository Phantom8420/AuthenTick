import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/** Deploys RoleManager first, then the contracts that defer to it. */
export default buildModule("AuthenTickProtocol", (m) => {
  const admin = m.getAccount(0);

  const roleManager = m.contract("RoleManager", [admin]);
  const nft = m.contract("AuthenTickNFT", [roleManager]);
  const registry = m.contract("OwnershipRegistry", [roleManager, nft]);

  return { roleManager, nft, registry };
});

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { keccak256, toHex } from "viem";

const MANUFACTURER = keccak256(toHex("MANUFACTURER_ROLE"));
const DISTRIBUTOR = keccak256(toHex("DISTRIBUTOR_ROLE"));
const RETAILER = keccak256(toHex("RETAILER_ROLE"));

/**
 * Deploys RoleManager first, then the contracts that defer to it. The relayer
 * (the wallet the API signs with) is granted the three supply-chain roles;
 * pass `--parameters` to use a different address than the deployer.
 */
export default buildModule("AuthenTickProtocol", (m) => {
  const admin = m.getAccount(0);
  const relayer = m.getParameter("relayer", admin);

  const roleManager = m.contract("RoleManager", [admin]);
  const nft = m.contract("AuthenTickNFT", [roleManager]);
  const registry = m.contract("OwnershipRegistry", [roleManager, nft]);

  m.call(roleManager, "grantRole", [MANUFACTURER, relayer], { id: "grantManufacturer" });
  m.call(roleManager, "grantRole", [DISTRIBUTOR, relayer], { id: "grantDistributor" });
  m.call(roleManager, "grantRole", [RETAILER, relayer], { id: "grantRetailer" });

  return { roleManager, nft, registry };
});

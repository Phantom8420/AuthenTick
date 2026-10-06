import { network } from "hardhat";
import { keccak256, toHex } from "viem";

export const role = (name: string) => keccak256(toHex(name));
export const MANUFACTURER = role("MANUFACTURER_ROLE");
export const DISTRIBUTOR = role("DISTRIBUTOR_ROLE");
export const RETAILER = role("RETAILER_ROLE");

export const GTIN = "04012345678901";

export async function deployProtocol() {
  const { viem } = await network.connect();
  const [admin, maker, shipper, shop, stranger] = await viem.getWalletClients();

  const roles = await viem.deployContract("RoleManager", [admin.account.address]);
  const nft = await viem.deployContract("AuthenTickNFT", [roles.address]);
  const registry = await viem.deployContract("OwnershipRegistry", [roles.address, nft.address]);

  await roles.write.grantRole([MANUFACTURER, maker.account.address]);
  await roles.write.grantRole([DISTRIBUTOR, shipper.account.address]);
  await roles.write.grantRole([RETAILER, shop.account.address]);

  const mint = async (serial = "SN-1") => {
    const tokenId = await nft.read.tokenIdFor([GTIN, serial]);
    await nft.write.mintProduct([maker.account.address, GTIN, serial, 7n], { account: maker.account });
    return tokenId;
  };

  return { viem, admin, maker, shipper, shop, stranger, roles, nft, registry, mint };
}

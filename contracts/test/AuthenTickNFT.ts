import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("AuthenTickNFT", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [deployer, manufacturer] = await viem.getWalletClients();

  it("mints when caller has MANUFACTURER_ROLE", async function () {
    const nft = await viem.deployContract("AuthenTickNFT");
    const mRole = await nft.read.MANUFACTURER_ROLE();
    await nft.write.grantRole([mRole, manufacturer.account.address], {
      account: deployer.account,
    });

    const { result: tokenId } = await publicClient.simulateContract({
      address: nft.address,
      abi: nft.abi,
      functionName: "mintProduct",
      args: [manufacturer.account.address, "00012345678905", "SN-001", 42n],
      account: manufacturer.account,
    });

    await nft.write.mintProduct(
      [manufacturer.account.address, "00012345678905", "SN-001", 42n],
      { account: manufacturer.account },
    );

    const meta = await nft.read.getProduct([tokenId]);
    assert.equal(meta.gtin, "00012345678905");
    assert.equal(meta.serial, "SN-001");
    assert.equal(meta.isVerified, true);
  });
});

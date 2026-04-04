import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("OwnershipRegistry", async function () {
  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();

  it("updates lifecycle stage for registrar", async function () {
    const registry = await viem.deployContract("OwnershipRegistry", [deployer.account.address]);

    await registry.write.setStage([1n, 2], { account: deployer.account });
    const stage = await registry.read.stageOf([1n]);
    assert.equal(stage, 2);
  });
});

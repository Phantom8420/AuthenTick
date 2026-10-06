import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { deployProtocol } from "./helpers.js";

describe("OwnershipRegistry", () => {
  it("walks a product through the full lifecycle in order", async () => {
    const { registry, maker, shipper, shop, mint } = await deployProtocol();
    const id = await mint();

    await registry.write.advance([id], { account: maker.account });
    assert.equal(await registry.read.stageOf([id]), 1);
    await registry.write.advance([id], { account: shipper.account });
    assert.equal(await registry.read.stageOf([id]), 2);
    await registry.write.advance([id], { account: shop.account });
    assert.equal(await registry.read.stageOf([id]), 3);
    await registry.write.advance([id], { account: shop.account });
    assert.equal(await registry.read.stageOf([id]), 4);
  });

  it("does not let a stage be skipped or taken by the wrong role", async () => {
    const { registry, maker, shipper, shop, mint } = await deployProtocol();
    const id = await mint();

    await assert.rejects(registry.write.advance([id], { account: shop.account }), /MissingRole/);
    await registry.write.advance([id], { account: maker.account });
    await assert.rejects(registry.write.advance([id], { account: shop.account }), /MissingRole/);
    await registry.write.advance([id], { account: shipper.account });
  });

  it("stops after the product reaches the consumer", async () => {
    const { registry, maker, shipper, shop, mint } = await deployProtocol();
    const id = await mint();
    await registry.write.advance([id], { account: maker.account });
    await registry.write.advance([id], { account: shipper.account });
    await registry.write.advance([id], { account: shop.account });
    await registry.write.advance([id], { account: shop.account });
    await assert.rejects(registry.write.advance([id], { account: shop.account }), /InvalidTransition/);
  });

  it("rejects unknown and revoked products", async () => {
    const { registry, nft, maker, mint } = await deployProtocol();
    await assert.rejects(registry.write.advance([999n], { account: maker.account }), /UnknownProduct/);

    const id = await mint();
    await nft.write.revokeProduct([id, "recall"], { account: maker.account });
    await assert.rejects(registry.write.advance([id], { account: maker.account }), /ProductRevoked/);
  });

  it("follows role revocation on the shared RoleManager", async () => {
    const { registry, roles, maker, mint } = await deployProtocol();
    const id = await mint();
    const manufacturerRole = await registry.read.MANUFACTURER_ROLE();
    await roles.write.revokeRole([manufacturerRole, maker.account.address]);
    await assert.rejects(registry.write.advance([id], { account: maker.account }), /MissingRole/);
  });
});

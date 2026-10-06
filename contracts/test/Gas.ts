import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { GTIN, deployProtocol } from "./helpers.js";

// Measures what each on-chain action costs and fails if one gets noticeably more expensive.
// Run `npm test` and read the table to quote real numbers.
describe("gas costs", () => {
  it("stays within budget for the whole product life", async () => {
    const { viem, nft, registry, maker, shipper, shop } = await deployProtocol();
    const client = await viem.getPublicClient();
    const used = async (hash: `0x${string}`) => Number((await client.getTransactionReceipt({ hash })).gasUsed);

    const id = await nft.read.tokenIdFor([GTIN, "GAS-1"]);
    const rows: Array<[string, number, number]> = [];
    const check = async (label: string, hash: `0x${string}`, budget: number) => {
      const gas = await used(hash);
      rows.push([label, gas, budget]);
      assert.ok(gas <= budget, label + " used " + gas + " gas, budget " + budget);
    };

    await check("mint (ERC-721 + metadata)", await nft.write.mintProduct([maker.account.address, GTIN, "GAS-1", 7n], { account: maker.account }), 215_000);
    await check("stage 1: Minted", await registry.write.advance([id], { account: maker.account }), 70_000);
    await check("stage 2: InDistribution", await registry.write.advance([id], { account: shipper.account }), 52_000);
    await check("stage 3: AtRetail", await registry.write.advance([id], { account: shop.account }), 52_000);
    await check("stage 4: ConsumerOwned", await registry.write.advance([id], { account: shop.account }), 52_000);
    await check("revoke", await nft.write.revokeProduct([id, "recall"], { account: maker.account }), 44_000);

    const total = rows.slice(0, 5).reduce((n, r) => n + r[1], 0);
    console.log("\n  action                          gas");
    for (const [label, gas] of rows) console.log("  " + label.padEnd(30) + String(gas).padStart(8));
    console.log("  " + "full life (mint + 4 stages)".padEnd(30) + String(total).padStart(8) + "\n");
  });
});

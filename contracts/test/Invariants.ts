import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { deployProtocol } from "./helpers.js";

// small seeded generator so a failing run can be replayed
const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 2 ** 32;
};

describe("OwnershipRegistry invariants", () => {
  for (const seed of [1, 7, 42]) {
    it(`matches a reference model under random calls (seed ${seed})`, async () => {
      const { registry, nft, maker, shipper, shop, stranger, mint } = await deployProtocol();
      const next = rng(seed);
      const pick = <T,>(xs: T[]) => xs[Math.floor(next() * xs.length)];

      // who is allowed to take each stage, mirroring the contract's rules
      const callers = [maker, shipper, shop, stranger];
      const allowed = [maker, shipper, shop, shop];

      const ids = [await mint("A"), await mint("B"), await mint("C")];
      const model = new Map(ids.map((id) => [id, { stage: 0, revoked: false }]));

      for (let i = 0; i < 60; i++) {
        const id = pick(ids);
        const m = model.get(id)!;

        // now and then recall a product
        if (next() < 0.04 && !m.revoked) {
          await nft.write.revokeProduct([id, "recall"], { account: maker.account });
          m.revoked = true;
          continue;
        }

        const caller = pick(callers);
        const mayAdvance = !m.revoked && m.stage < 4 && caller === allowed[m.stage];
        const before = m.stage;

        if (mayAdvance) {
          await registry.write.advance([id], { account: caller.account });
          m.stage++;
        } else {
          await assert.rejects(registry.write.advance([id], { account: caller.account }));
        }

        const onChain = Number(await registry.read.stageOf([id]));
        assert.equal(onChain, m.stage, `stage of ${id} after step ${i}`);
        assert.ok(onChain >= before && onChain <= 4, "stage never goes backwards or past the end");
      }

      for (const id of ids) {
        assert.equal(Number(await registry.read.stageOf([id])), model.get(id)!.stage);
      }
    });
  }

  it("never lets the same serial be minted twice, whoever asks", async () => {
    const { nft, maker, shipper, mint } = await deployProtocol();
    await mint("DUP");
    await assert.rejects(mint("DUP"), /AlreadyMinted/);
    await assert.rejects(
      nft.write.mintProduct([shipper.account.address, "04012345678901", "DUP2", 1n], { account: shipper.account }),
      /NotManufacturer/,
    );
    void maker;
  });
});

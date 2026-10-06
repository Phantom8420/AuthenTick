import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { GTIN, deployProtocol } from "./helpers.js";

describe("AuthenTickNFT", () => {
  it("mints a digital twin for a manufacturer", async () => {
    const { nft, maker, mint } = await deployProtocol();
    const tokenId = await mint("SN-001");

    const meta = (await nft.read.getProduct([tokenId])) as {
      gtin: string;
      serial: string;
      batchId: bigint;
      isVerified: boolean;
      manufacturer: string;
    };
    assert.equal(meta.gtin, GTIN);
    assert.equal(meta.serial, "SN-001");
    assert.equal(meta.batchId, 7n);
    assert.equal(meta.isVerified, true);
    assert.equal(meta.manufacturer.toLowerCase(), maker.account.address.toLowerCase());
    assert.equal(((await nft.read.ownerOf([tokenId])) as string).toLowerCase(), maker.account.address.toLowerCase());
  });

  it("rejects minting from accounts without the manufacturer role", async () => {
    const { nft, stranger } = await deployProtocol();
    await assert.rejects(
      nft.write.mintProduct([stranger.account.address, GTIN, "SN-X", 1n], { account: stranger.account }),
      /NotManufacturer/,
    );
  });

  it("rejects a duplicate gtin and serial", async () => {
    const { nft, maker, mint } = await deployProtocol();
    await mint("SN-DUP");
    await assert.rejects(
      nft.write.mintProduct([maker.account.address, GTIN, "SN-DUP", 7n], { account: maker.account }),
      /AlreadyMinted/,
    );
  });

  it("rejects malformed gtin and empty serial", async () => {
    const { nft, maker } = await deployProtocol();
    await assert.rejects(
      nft.write.mintProduct([maker.account.address, "123", "SN", 1n], { account: maker.account }),
      /InvalidInput/,
    );
    await assert.rejects(
      nft.write.mintProduct([maker.account.address, GTIN, "", 1n], { account: maker.account }),
      /InvalidInput/,
    );
  });

  it("keeps ambiguous concatenations apart", async () => {
    const { nft } = await deployProtocol();
    const a = await nft.read.tokenIdFor(["04012345678901", "2"]);
    const b = await nft.read.tokenIdFor(["0401234567890", "12"]);
    assert.notEqual(a, b);
  });

  it("lets the manufacturer or an admin revoke, nobody else", async () => {
    const { nft, maker, admin, stranger, mint } = await deployProtocol();
    const first = await mint("SN-A");
    const second = await mint("SN-B");

    await assert.rejects(nft.write.revokeProduct([first, "nope"], { account: stranger.account }), /NotAuthorized/);

    await nft.write.revokeProduct([first, "cloned serial"], { account: maker.account });
    assert.equal(await nft.read.isAuthentic([first]), false);

    await nft.write.revokeProduct([second, "recall"], { account: admin.account });
    assert.equal(await nft.read.isAuthentic([second]), false);
  });

  it("reverts for unknown tokens", async () => {
    const { nft } = await deployProtocol();
    await assert.rejects(nft.read.getProduct([123n]), /UnknownProduct/);
    assert.equal(await nft.read.isAuthentic([123n]), false);
  });
});

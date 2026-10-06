import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { MANUFACTURER, deployProtocol } from "./helpers.js";

describe("RoleManager", () => {
  it("only lets the admin grant roles", async () => {
    const { roles, stranger } = await deployProtocol();
    await assert.rejects(
      roles.write.grantRole([MANUFACTURER, stranger.account.address], { account: stranger.account }),
      /AccessControlUnauthorizedAccount/,
    );
  });

  it("refuses a zero-address admin", async () => {
    const { viem } = await deployProtocol();
    await assert.rejects(
      viem.deployContract("RoleManager", ["0x0000000000000000000000000000000000000000"]),
      /AdminRequired/,
    );
  });
});

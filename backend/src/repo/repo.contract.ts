import { describe, expect, it } from "vitest";
import { ConflictError, type Repository } from "./types.js";

const base = {
  tokenId: "0x01",
  name: "Watch",
  gtin: "04012345678901",
  serial: "SN-1",
  batchId: "B1",
  manufacturerId: "maker",
  currentOwner: "maker",
};
const evt = (bizStep: string) => ({ bizStep, readPoint: "gln", eventTime: new Date().toISOString() });

/** Behaviour every Repository implementation must share. */
export function repositoryContract(name: string, make: () => Promise<Repository>) {
  describe(`${name} repository`, () => {
    it("creates a product with its commissioning event", async () => {
      const repo = await make();
      const p = await repo.createProduct(base, evt("urn:epcglobal:cbv:bizstep:commissioning"));
      expect(p.status).toBe("PRODUCTION");
      expect(p.lastStep).toBe("commissioning");
      expect(await repo.listEvents("0x01")).toHaveLength(1);
      await repo.close();
    });

    it("rejects a duplicate token id and a duplicate gtin and serial", async () => {
      const repo = await make();
      await repo.createProduct(base, evt("commissioning"));
      await expect(repo.createProduct(base, evt("commissioning"))).rejects.toBeInstanceOf(ConflictError);
      await expect(repo.createProduct({ ...base, tokenId: "0x02" }, evt("commissioning"))).rejects.toBeInstanceOf(
        ConflictError,
      );
      await repo.close();
    });

    it("advances only from the expected step", async () => {
      const repo = await make();
      await repo.createProduct(base, evt("commissioning"));
      const ok = await repo.advance("0x01", "commissioning", "shipping", "IN_TRANSIT", evt("shipping"));
      expect(ok?.status).toBe("IN_TRANSIT");
      const stale = await repo.advance("0x01", "commissioning", "shipping", "IN_TRANSIT", evt("shipping"));
      expect(stale).toBeNull();
      expect(await repo.listEvents("0x01")).toHaveLength(2);
      await repo.close();
    });

    it("stores user roles case-insensitively", async () => {
      const repo = await make();
      await repo.setUserRole("0xABCDEF", "RETAILER");
      expect((await repo.getUser("0xabcdef"))?.role).toBe("RETAILER");
      expect(await repo.getUser("0x999")).toBeNull();
      await repo.close();
    });
  });
}

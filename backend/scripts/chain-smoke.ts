/**
 * End-to-end check of on-chain anchoring against a real (local) Hardhat chain:
 * starts a node, deploys the protocol, then drives the API through a full
 * product life and reads the contracts back. Run from the backend folder:
 *   npm run smoke:chain
 */
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { readFileSync } from "node:fs";
import { createConnection } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import request from "supertest";
import { createApp } from "../src/app.js";
import { createChain, nftAbi, registryAbi } from "../src/config/blockchain.js";
import { loadEnv } from "../src/config/env.js";
import { MemoryRepo } from "../src/repo/memoryRepo.js";

const contractsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../contracts");
const RPC = "http://127.0.0.1:8545";
// the first well-known Hardhat dev account; it deploys, so it is admin and the relayer
const DEV_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

let node: ChildProcess | undefined;

function stopNode() {
  if (!node?.pid) return;
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(node.pid), "/t", "/f"], { stdio: "ignore" });
  else node.kill("SIGTERM");
}

const portOpen = () =>
  new Promise<boolean>((resolve) => {
    const s = createConnection({ port: 8545, host: "127.0.0.1" }, () => {
      s.end();
      resolve(true);
    });
    s.on("error", () => resolve(false));
  });

function check(cond: unknown, what: string) {
  if (!cond) throw new Error(`FAILED: ${what}`);
  console.log(`ok  ${what}`);
}

async function main() {
  node = spawn("npx", ["hardhat", "node"], { cwd: contractsDir, shell: true, stdio: ["ignore", "pipe", "pipe"] });
  node.stdout?.resume();
  node.stderr?.on("data", (d) => process.stderr.write(d));
  for (let i = 0; i < 60 && !(await portOpen()); i++) await new Promise((r) => setTimeout(r, 1000));
  check(await portOpen(), "local chain is up");

  const deploy = spawnSync(
    "npx",
    ["hardhat", "ignition", "deploy", "ignition/modules/AuthenTickProtocol.ts", "--network", "localhost"],
    { cwd: contractsDir, shell: true, encoding: "utf8" },
  );
  if (deploy.status !== 0) throw new Error(`deploy failed:\n${deploy.stdout}\n${deploy.stderr}`);

  const addresses = JSON.parse(
    readFileSync(path.join(contractsDir, "ignition/deployments/chain-31337/deployed_addresses.json"), "utf8"),
  ) as Record<string, string>;
  const nftAddress = addresses["AuthenTickProtocol#AuthenTickNFT"];
  const registryAddress = addresses["AuthenTickProtocol#OwnershipRegistry"];
  check(nftAddress && registryAddress, "contracts deployed");

  const env = loadEnv({
    NODE_ENV: "test",
    AUTH_REQUIRED: "false",
    JWT_SECRET: "smoke-secret-smoke-secret",
    RPC_URL: RPC,
    NFT_CONTRACT_ADDRESS: nftAddress,
    REGISTRY_CONTRACT_ADDRESS: registryAddress,
    RELAYER_PRIVATE_KEY: DEV_KEY,
  });
  const api = request(createApp(env, new MemoryRepo(), createChain(env)));
  const health = await api.get("/api/health");
  check(health.body.chain && health.body.anchoring, "API reports chain + anchoring on");

  // read the contracts directly, not through the API, so the check is independent
  const provider = new JsonRpcProvider(RPC);
  const nft = new Contract(nftAddress, nftAbi, provider);
  const registry = new Contract(registryAddress, registryAbi, provider);
  const relayer = new Wallet(DEV_KEY).address;

  const minted = await api
    .post("/api/products")
    .send({ name: "Chronograph", gtin: "04012345678901", serial: "SMOKE-1", batchId: "LOT-7", manufacturerId: relayer });
  check(minted.status === 201, `minted through the API (${minted.body.error ?? minted.body.tokenId})`);
  const id = BigInt(minted.body.tokenId);
  check((await nft.ownerOf(id)).toLowerCase() === relayer.toLowerCase(), "NFT exists on-chain and is owned by the manufacturer");
  check(Number(await registry.stageOf(id)) === 1, "registry stage is Minted");

  for (const [step, stage] of [["shipping", 2], ["receiving", 3], ["storing", 3], ["selling", 4]] as const) {
    const r = await api.post("/api/events").send({ tokenId: minted.body.tokenId, bizStep: step, readPoint: "gln:1" });
    check(r.status === 201, `recorded ${step} (${r.body.error ?? ""})`);
    check(Number(await registry.stageOf(id)) === stage, `registry stage after ${step} is ${stage}`);
  }

  const record = await api.get(`/api/metadata/${minted.body.tokenId}`);
  check(record.body.onChain?.stage === "ConsumerOwned" && record.body.onChain.isAuthentic, "record shows the on-chain stage");

  const dup = await api
    .post("/api/products")
    .send({ name: "Clone", gtin: "04012345678901", serial: "SMOKE-1", batchId: "LOT-7", manufacturerId: relayer });
  check(dup.status === 502, "a cloned serial is refused by the contract");

  // revoke a second item, then the chain must freeze it even though the database would allow the step
  const second = await api
    .post("/api/products")
    .send({ name: "Chronograph", gtin: "04012345678901", serial: "SMOKE-2", batchId: "LOT-7", manufacturerId: relayer });
  const signer = new Wallet(DEV_KEY, provider);
  const admin = new Contract(nftAddress, ["function revokeProduct(uint256 tokenId, string reason)"], signer);
  await (await admin.revokeProduct(BigInt(second.body.tokenId), "recall")).wait();
  const frozen = await api.post("/api/events").send({ tokenId: second.body.tokenId, bizStep: "shipping", readPoint: "gln:1" });
  check(frozen.status === 502, "a revoked product is frozen on-chain");
  const after = await api.get(`/api/events/product/${second.body.tokenId}`);
  check(after.body.length === 1, "and the refused step was not recorded");

  console.log("\nchain smoke test passed");
}

main()
  .then(() => {
    stopNode();
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    stopNode();
    process.exit(1);
  });

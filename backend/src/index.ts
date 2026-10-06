import "dotenv/config";
import { loadEnv } from "./config/env.js";
import { createChain } from "./config/blockchain.js";
import { createApp } from "./app.js";
import { MemoryRepo } from "./repo/memoryRepo.js";
import { MongoRepo } from "./repo/mongoRepo.js";

async function main() {
  const env = loadEnv();
  const repo = env.MONGODB_URI ? await MongoRepo.connect(env.MONGODB_URI) : new MemoryRepo();
  const chain = createChain(env);

  const log = (msg: string, extra: Record<string, unknown> = {}) => console.log(JSON.stringify({ level: "info", msg, ...extra }));
  log("config", {
    store: env.MONGODB_URI ? "mongodb" : "in-memory (data is lost on restart)",
    auth: env.AUTH_REQUIRED ? "wallet sign-in required for writes" : "open (set AUTH_REQUIRED=true to lock down)",
    chain: chain ? String(chain.nft.target) : "disabled (set RPC_URL and NFT_CONTRACT_ADDRESS)",
    anchoring: chain?.write ? `relayer ${chain.write.relayer}` : "off (set RELAYER_PRIVATE_KEY and REGISTRY_CONTRACT_ADDRESS)",
  });

  const app = createApp(env, repo, chain);
  const server = app.listen(env.PORT, () => log("listening", { port: env.PORT }));

  const stop = () => server.close(() => void repo.close().finally(() => process.exit(0)));
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

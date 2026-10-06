import "dotenv/config";
import { loadEnv } from "./config/env.js";
import { createNftClient } from "./config/blockchain.js";
import { createApp } from "./app.js";
import { MemoryRepo } from "./repo/memoryRepo.js";
import { MongoRepo } from "./repo/mongoRepo.js";

async function main() {
  const env = loadEnv();
  const repo = env.MONGODB_URI ? await MongoRepo.connect(env.MONGODB_URI) : new MemoryRepo();
  const nft = createNftClient(env);

  console.log(`store: ${env.MONGODB_URI ? "mongodb" : "in-memory (data is lost on restart)"}`);
  console.log(`auth: ${env.AUTH_REQUIRED ? "wallet sign-in required for writes" : "open (set AUTH_REQUIRED=true to lock down)"}`);
  console.log(`chain: ${nft ? String(nft.target) : "disabled (set RPC_URL and NFT_CONTRACT_ADDRESS)"}`);

  const app = createApp(env, repo, nft);
  const server = app.listen(env.PORT, () => console.log(`AuthenTick API listening on port ${env.PORT}`));

  const stop = () => server.close(() => void repo.close().finally(() => process.exit(0)));
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

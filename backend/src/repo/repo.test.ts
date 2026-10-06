import mongoose from "mongoose";
import { describe } from "vitest";
import { MemoryRepo } from "./memoryRepo.js";
import { MongoRepo } from "./mongoRepo.js";
import { repositoryContract } from "./repo.contract.js";

repositoryContract("memory", async () => new MemoryRepo());

// Runs against a real MongoDB when MONGODB_TEST_URI is set (CI provides one).
const uri = process.env.MONGODB_TEST_URI;
describe.skipIf(!uri)("mongo", () => {
  repositoryContract("mongo", async () => {
    const repo = await MongoRepo.connect(uri!);
    await mongoose.connection.dropDatabase();
    await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
    return repo;
  });
});

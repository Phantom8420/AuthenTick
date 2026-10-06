// Hardhat's EDR simulator can crash when several test files boot it at once, so run files one by one.
import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

const run = (args) => spawnSync("npx", ["hardhat", ...args], { stdio: "inherit", shell: true }).status ?? 1;

if (run(["compile"]) !== 0) process.exit(1);

const files = readdirSync("test").filter((f) => f.endsWith(".ts") && f !== "helpers.ts");
let failed = false;
for (const f of files) {
  if (run(["test", "nodejs", "--no-compile", `test/${f}`]) !== 0) failed = true;
}
process.exit(failed ? 1 : 0);

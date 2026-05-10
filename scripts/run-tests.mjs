import { spawn } from "node:child_process";
import { glob } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

const PATTERNS = [
  "test/*.test.js",
  "test/cli/**/*.test.js",
  "test/client/**/*.test.js",
  "test/e2e/**/*.test.js",
  "test/server/**/*.test.js",
];

const files = new Set();
for (const pattern of PATTERNS) {
  for await (const file of glob(pattern, { cwd: ROOT })) {
    files.add(file);
  }
}

const testFiles = [...files].sort();

const nodeArgs = [
  "--import",
  "./scripts/node-test-setup.mjs",
  "--experimental-test-module-mocks",
  "--test",
  "--test-timeout=400000",
  "--test-force-exit",
  ...process.argv.slice(2),
  ...testFiles,
];

const child = spawn(process.execPath, nodeArgs, {
  cwd: ROOT,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exitCode = code ?? 1;
  }
});

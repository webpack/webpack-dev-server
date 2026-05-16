import { spawn } from "node:child_process";
import { glob, mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

// Pre-create any directory referenced by `--test-reporter-destination` because
// Node's reporter stream opens the file with `fs.createWriteStream` and won't
// create missing parent directories.
for (let i = 0; i < process.argv.length; i++) {
  const arg = process.argv[i];
  let destination;
  if (arg === "--test-reporter-destination") {
    destination = process.argv[i + 1];
  } else if (arg?.startsWith("--test-reporter-destination=")) {
    destination = arg.slice("--test-reporter-destination=".length);
  }
  if (destination && destination !== "stdout" && destination !== "stderr") {
    await mkdir(path.dirname(path.resolve(ROOT, destination)), {
      recursive: true,
    });
  }
}

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

const testFiles = [...files].toSorted();

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

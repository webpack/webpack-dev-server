// Pre-test port validation. Runs once before `npm run test:only` (via the
// pretest:only npm hook) to assert that none of the ports the test suite
// will claim are already bound on localhost.
//
// We do this via an npm pre-hook (rather than node:test's
// `--test-global-setup`) because that flag was only added in Node v24.0.0,
// and the package supports Node v22.x.

import tcpPortUsed from "tcp-port-used";
import webpack from "webpack";
import ports from "../test/ports-map.js";

const { version } = webpack;
// eslint-disable-next-line no-console
console.log(`\n Running tests for webpack @${version} \n`);

const checks = [];
for (const key of Object.keys(ports)) {
  const value = ports[key];
  const arr = Array.isArray(value) ? value : [value];

  for (const port of arr) {
    checks.push(
      tcpPortUsed.check(port, "localhost").then((inUse) => {
        if (inUse) {
          throw new Error(`${port} has already used. [${key}]`);
        }
      }),
    );
  }
}

try {
  await Promise.all(checks);
} catch (err) {
  // eslint-disable-next-line no-console
  console.error(err);
  // eslint-disable-next-line n/no-process-exit
  process.exit(1);
}

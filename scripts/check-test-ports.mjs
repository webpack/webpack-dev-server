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

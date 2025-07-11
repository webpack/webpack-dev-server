"use strict";

const tcpPortUsed = require("tcp-port-used");
const { version } = require("webpack");
const ports = require("../test/ports-map");

// eslint-disable-next-line no-console
console.log(`\n Running tests for webpack @${version} \n`);

/**
 *
 */
async function validatePorts() {
  const samples = [];

  for (const key of Object.keys(ports)) {
    const value = ports[key];
    const arr = Array.isArray(value) ? value : [value];

    for (const port of arr) {
      const check = tcpPortUsed.check(port, "localhost").then((inUse) => {
        if (inUse) {
          throw new Error(`${port} has already used. [${key}]`);
        }
      });

      samples.push(check);
    }
  }

  try {
    await Promise.all(samples);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  }
}

module.exports = validatePorts;

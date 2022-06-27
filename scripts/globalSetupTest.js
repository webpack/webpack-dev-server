"use strict";

// eslint-disable-next-line import/no-extraneous-dependencies
const tcpPortUsed = require("tcp-port-used");
const { version } = require("webpack");
const ports = require("../test/ports-map");

// eslint-disable-next-line no-console
console.log(`\n Running tests for webpack @${version} \n`);

async function validatePorts() {
  const samples = [];

  Object.keys(ports).forEach((key) => {
    const value = ports[key];
    const arr = Array.isArray(value) ? value : [value];

    arr.forEach((port) => {
      const check = tcpPortUsed.check(port, "localhost").then((inUse) => {
        if (inUse) {
          throw new Error(`${port} has already used. [${key}]`);
        }
      });

      samples.push(check);
    });
  });

  try {
    await Promise.all(samples);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  }
}

module.exports = validatePorts;

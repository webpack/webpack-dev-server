"use strict";

// eslint-disable-next-line import/no-extraneous-dependencies
const { sync } = require("execa");

try {
  sync("npm run build:types", [], {
    cwd: __dirname,
    reject: false,
    shell: true,
  });

  const { stdout } = sync("git status --porcelain", [], {
    shell: true,
  });

  if (!stdout.trim()) {
    // eslint-disable-next-line no-console
    console.log("types are up-to-date.");
    process.exit(0);
  } else {
    // eslint-disable-next-line no-console
    console.log(`Please update types by running "npm run build:types"`);
    process.exit(2);
  }
} catch (error) {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(2);
}

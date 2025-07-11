"use strict";

const fs = require("node:fs");
const path = require("node:path");

/**
 *
 */
async function setup() {
  const serverCodePath = path.resolve(__dirname, "../lib/Server.js");
  let serverCode = await fs.promises.readFile(serverCodePath, "utf8");

  serverCode = serverCode.replaceAll(
    /\(await import\((".+")\)\)\.default/g,
    "require($1)",
  );

  await fs.promises.writeFile(serverCodePath, serverCode);
}

Promise.resolve()
  .then(() => setup())
  .then(
    () => {
      // eslint-disable-next-line no-console
      console.log("The setup was successful");
    },
    (error) => {
      throw error;
    },
  );

"use strict";

const path = require("node:path");
const fs = require("graceful-fs");

/**
 * @returns {Promise<void>}
 */
async function extendTypes() {
  const typesPath = path.resolve(__dirname, "../types/lib/Server.d.ts");
  const content = await fs.promises.readFile(typesPath, "utf8");
  const newContent = `${content}
// DO NOT REMOVE THIS!
type DevServerConfiguration = Configuration;
declare module "webpack" {
  interface Configuration {
    /**
     * Can be used to configure the behaviour of webpack-dev-server when
     * the webpack config is passed to webpack-dev-server CLI.
     */
    devServer?: DevServerConfiguration | undefined;
  }
}
`;

  await fs.promises.writeFile(typesPath, newContent);
}

// eslint-disable-next-line unicorn/prefer-top-level-await
Promise.resolve().then(
  () => extendTypes(),
  (error) => {
    throw error;
  },
);

import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "graceful-fs";

/**
 * @returns {Promise<void>}
 */
async function extendTypes() {
  const typesPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../types/lib/Server.d.ts",
  );
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

await extendTypes();

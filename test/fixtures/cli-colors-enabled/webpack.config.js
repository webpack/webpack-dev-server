import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  mode: "development",
  stats: {
    colors: true,
  },
  context: __dirname,
  entry: "./foo.js",
  infrastructureLogging: {
    colors: true,
  },
};

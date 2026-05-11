import path, { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  mode: "development",
  stats: "detailed",
  context: __dirname,
  entry: {
    foo: resolve(__dirname, "./foo.js"),
    bar: resolve(__dirname, "./bar.js"),
  },
};

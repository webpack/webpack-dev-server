import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  mode: "development",
  entry: path.resolve(__dirname, "foo.js"),
  devServer: {
    static: path.resolve(__dirname, "static"),
  },
};

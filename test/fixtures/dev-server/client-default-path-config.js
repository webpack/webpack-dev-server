import path, { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  mode: "development",
  stats: "detailed",
  entry: resolve(__dirname, "./foo.js"),
  devServer: {
    webSocketServer: {
      type: "ws",
    },
  },
};

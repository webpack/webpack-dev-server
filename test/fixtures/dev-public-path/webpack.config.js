import path, { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  mode: "development",
  entry: join(__dirname, "foo.js"),
  devServer: {
    devMiddleware: {
      publicPath: "/foo/bar",
    },
  },
};

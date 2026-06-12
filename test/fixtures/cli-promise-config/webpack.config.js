import path, { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default () =>
  new Promise((resolve) => {
    resolve({
      mode: "development",
      entry: join(__dirname, "foo.js"),
    });
  });

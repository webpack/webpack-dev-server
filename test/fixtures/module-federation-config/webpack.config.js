import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  mode: "development",
  target: "node",
  stats: "none",
  context: __dirname,
  entry: ["./entry1.js", "./entry2.js"],
  output: {
    path: "/",
    libraryTarget: "umd",
  },
  infrastructureLogging: {
    level: "warn",
  },
};

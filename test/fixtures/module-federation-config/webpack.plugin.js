import path from "node:path";
import { fileURLToPath } from "node:url";
import webpack from "webpack";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { ModuleFederationPlugin } = webpack.container;

export default {
  mode: "development",
  target: "node",
  stats: "none",
  context: __dirname,
  entry: ["./entry1.js"],
  plugins: [
    new ModuleFederationPlugin({
      name: "app1",
      library: { type: "var", name: "app1" },
      filename: "remoteEntry.js",
      exposes: {
        "./entry1": "./entry1",
      },
    }),
  ],
  infrastructureLogging: {
    level: "warn",
  },
};

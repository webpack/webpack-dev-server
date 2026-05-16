import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  mode: "development",
  context: __dirname,
  entry: () => "./foo.js",
  plugins: [
    {
      apply(compiler) {
        compiler.hooks.done.tap("webpack-dev-server", (stats) => {
          let exitCode = 0;
          if (stats.hasErrors()) {
            exitCode = 1;
          }
          setTimeout(() => process.exit(exitCode));
        });
      },
    },
  ],
  infrastructureLogging: {
    level: "warn",
  },
};

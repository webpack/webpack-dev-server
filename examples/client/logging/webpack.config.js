// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
import { setup } from "../../util.js";

export default setup(
  {
    context: import.meta.dirname,
    entry: "./app.js",
    plugins: [
      {
        apply(compiler) {
          compiler.hooks.thisCompilation.tap(
            "warnings-webpack-plugin",
            (compilation) => {
              compilation.warnings.push(
                new Error("Manual warnings produced during compilation."),
              );
            },
          );
        },
      },
    ],
    devServer: {
      client: {
        logging: "info",
      },
    },
  },
  import.meta.url,
);

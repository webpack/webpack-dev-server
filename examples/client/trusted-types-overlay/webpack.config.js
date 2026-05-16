import path from "node:path";
import HtmlWebpackPlugin from "html-webpack-plugin";
// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
import { setup } from "../../util.js";

const config = setup(
  {
    context: import.meta.dirname,
    // create error for overlay
    entry: "./app.js",
    output: {
      trustedTypes: { policyName: "webpack" },
    },
    devServer: {
      headers: {
        "Content-Security-Policy": "require-trusted-types-for 'script'",
      },
      client: {
        overlay: {
          trustedTypesPolicyName: "webpack#dev-overlay",
        },
      },
    },
  },
  import.meta.url,
);

// overwrite the index.html with our own to enable Trusted Types
config.plugins[0] = new HtmlWebpackPlugin({
  filename: "index.html",
  template: path.join(import.meta.dirname, "./layout.html"),
  title: "trusted types overlay",
});

export default config;

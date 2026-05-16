import HtmlWebpackPlugin from "html-webpack-plugin";
// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
import { setup } from "../util.js";

export default setup(
  {
    context: import.meta.dirname,
    entry: "./app.js",
    plugins: [
      new HtmlWebpackPlugin({
        filename: "example.html",
        template: "../.assets/layout.html",
        title: "Open Target / Example",
      }),
    ],
  },
  import.meta.url,
);

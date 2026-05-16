import HtmlWebpackPlugin from "html-webpack-plugin";
// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
import { setup } from "../util.js";

export default [
  setup(
    {
      context: import.meta.dirname,
      entry: "./app1.js",
      output: {
        filename: "app1.js",
      },
      plugins: [
        new HtmlWebpackPlugin({
          filename: "example1.html",
          template: "../.assets/layout.html",
          title: "Open Target (Multiple) / Example / Page 1",
        }),
      ],
    },
    import.meta.url,
  ),
  setup(
    {
      context: import.meta.dirname,
      entry: "./app2.js",
      output: {
        filename: "app2.js",
      },
      plugins: [
        new HtmlWebpackPlugin({
          filename: "example2.html",
          template: "../.assets/layout.html",
          title: "Open Target (Multiple) / Example / Page 2",
        }),
      ],
    },
    import.meta.url,
  ),
];

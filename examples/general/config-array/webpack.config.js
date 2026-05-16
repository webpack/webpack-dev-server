// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
import { setup } from "../../util.js";

const moduleRuleForPNG = {
  test: /\.png$/,
  type: "asset/resource",
  generator: {
    filename: "images/[hash][ext][query]",
  },
};

export default [
  setup(
    {
      context: import.meta.dirname,
      entry: "./app.js",
      module: {
        rules: [
          {
            test: /\.less$/,
            use: ["style-loader", "css-loader", "less-loader"],
          },
          {
            ...moduleRuleForPNG,
          },
        ],
      },
    },
    import.meta.url,
  ),
  {
    context: import.meta.dirname,
    entry: "./app.js",
    output: {
      filename: "bundle2.js",
    },
    mode: "development",
    module: {
      rules: [
        {
          test: /\.less$/,
          use: ["style-loader", "css-loader", "less-loader"],
        },
        {
          test: /\.png$/,
          type: "asset/resource",
          generator: {
            filename: "images/[hash][ext][query]",
          },
        },
      ],
    },
    optimization: {
      minimize: true,
    },
  },
];

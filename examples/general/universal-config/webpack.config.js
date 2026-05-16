import { setup } from "../../util.js";

export default [
  setup(
    {
      mode: "development",
      entry: "./client.js",
      output: {
        filename: "client.js",
      },
      context: import.meta.dirname,
    },
    import.meta.url,
  ),
  {
    mode: "development",
    target: "node",
    entry: "./server.js",
    output: {
      filename: "server.js",
    },
    context: import.meta.dirname,
    node: false,
  },
];

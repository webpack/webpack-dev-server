// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
import { setup } from "../../util.js";

export default [
  setup(
    {
      devtool: "source-map",
      target: "web",
      entry: "./web.js",
    },
    import.meta.url,
  ),
  {
    devtool: "source-map",
    target: "webworker",
    entry: "./worker.js",
    output: {
      filename: "worker.bundle.js",
      path: import.meta.dirname,
    },
  },
];

// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
import connect from "connect";
import { setup } from "../../util.js";

export default setup(
  {
    context: import.meta.dirname,
    entry: "./app.js",
    devServer: {
      server: "http2",
      // Only `connect` supports `http2`
      app: () => connect(),
    },
  },
  import.meta.url,
);

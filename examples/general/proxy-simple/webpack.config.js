// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
import { setup } from "../../util.js";

export default setup(
  {
    context: import.meta.dirname,
    entry: "./app.js",
    devServer: {
      proxy: {
        "/api": "http://127.0.0.1:50545",
      },
    },
  },
  import.meta.url,
);

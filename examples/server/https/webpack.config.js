// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
import { setup } from "../../util.js";

export default setup(
  {
    context: import.meta.dirname,
    entry: "./app.js",
    devServer: {
      server: {
        type: "https",
        options: {
          key: "./ssl/server.key",
          pfx: "./ssl/server.pfx",
          cert: "./ssl/server.crt",
          ca: "./ssl/ca.pem",
          passphrase: "webpack-dev-server",
        },
      },
    },
  },
  import.meta.url,
);

import WebpackDevServer from "../../../lib/Server.js";
// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
import { setup } from "../../util.js";

const config = setup(
  {
    context: import.meta.dirname,
    entry: "./app.js",
    output: {
      filename: "bundle.js",
    },
    stats: {
      colors: true,
    },
  },
  import.meta.url,
);

// `setup()` populates `config.devServer.setupMiddlewares` so that the example
// layout assets (CSS, favicon, icons under `.assets/`) are served by the dev
// server. Forward those options to the plugin instance — without them the
// `<link rel="stylesheet">` from the shared layout would 404.
config.plugins.push(
  new WebpackDevServer({ ...config.devServer, port: 8090, open: true }),
);

export default config;

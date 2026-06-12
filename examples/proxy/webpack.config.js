import express from "express";
// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
import { setup } from "../util.js";

/**
 *
 */
async function listenProxyServer() {
  const proxyApp = express();

  proxyApp.get("/proxy", (req, res) => {
    res.send("response from proxy");
  });

  await new Promise((resolve) => {
    proxyApp.listen(5000, () => {
      resolve();
    });
  });
}

export default setup(
  {
    context: import.meta.dirname,
    entry: "./app.js",
    devServer: {
      onBeforeSetupMiddleware: async () => {
        await listenProxyServer();
      },
      proxy: [
        {
          context: "/proxy",
          target: "http://localhost:5000",
        },
      ],
    },
  },
  import.meta.url,
);

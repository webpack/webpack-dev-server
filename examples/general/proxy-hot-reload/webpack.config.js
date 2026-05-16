import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
import { setup } from "../../util.js";
import proxyConfig from "./proxy-config.js";

let proxyOptions = {
  context: "/api",
  target: proxyConfig.target,
  pathRewrite: proxyConfig.pathRewrite,
  changeOrigin: true,
};

fs.watch("./proxy-config.js", async () => {
  try {
    const cacheBustingUrl = `${
      pathToFileURL(path.resolve(import.meta.dirname, "./proxy-config.js")).href
    }?t=${Date.now()}`;
    const { default: newProxyConfig } = await import(cacheBustingUrl);

    if (proxyOptions.target !== newProxyConfig.target) {
      console.log("Proxy target changed:", newProxyConfig.target);
      proxyOptions = {
        context: "/api",
        target: newProxyConfig.target,
        pathRewrite: newProxyConfig.pathRewrite,
        changeOrigin: true,
      };
    }
  } catch {
    // ignore
  }
});

export default setup(
  {
    context: import.meta.dirname,
    entry: "./app.js",
    devServer: {
      proxy: [
        function proxy() {
          return proxyOptions;
        },
      ],
    },
  },
  import.meta.url,
);

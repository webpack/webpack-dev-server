import { createAdaptorServer } from "@hono/node-server";
// eslint-disable-next-line import/no-unresolved
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import wdm from "webpack-dev-middleware";
import { setup } from "../../util.js";

// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
export default setup(
  {
    context: import.meta.dirname,
    entry: "./app.js",
    devServer: {
      // WARNING:
      //
      // You always need to set up middlewares which you required for your app,
      // built-in middlewares (like `history-api-fallback`/etc) doesn't work by default with `hono`
      setupMiddlewares: (_, devServer) => [
        {
          name: "host-header-check",
          middleware: async (context, next) => {
            const headers = context.env.incoming.headers;
            const headerName = headers[":authority"] ? ":authority" : "host";

            if (!devServer.isValidHost(headers, headerName)) {
              return context.text("Invalid Host header", 403);
            }

            await next();
          },
        },
        {
          name: "cross-origin-header-check",
          middleware: async (context, next) => {
            const headers = context.env.incoming.headers;
            const headerName = headers[":authority"] ? ":authority" : "host";

            if (
              !devServer.isValidHost(headers, headerName, false) &&
              headers["sec-fetch-mode"] === "no-cors" &&
              headers["sec-fetch-site"] === "cross-site"
            ) {
              return context.text("Cross-Origin request blocked", 403);
            }

            if (
              devServer.options.allowedHosts !== "all" &&
              !devServer.isUserCORSWildcardEnabled()
            ) {
              context.header("Cross-Origin-Resource-Policy", "same-origin");
            }

            await next();
          },
        },
        {
          name: "webpack-dev-middleware",
          middleware: wdm.honoWrapper(devServer.compiler),
        },
        {
          name: "static",
          path: "/.assets/*",
          middleware: serveStatic({
            root: "../../.assets",
            rewriteRequestPath: (item) => item.replace(/^\/\.assets\//, "/"),
          }),
        },
      ],
      app: () => new Hono(),
      server: (_, app) =>
        createAdaptorServer({
          fetch: app.fetch,
          //
          // Uncomment for `https`
          // createServer: require('node:https').createServer,
          // serverOptions: {
          //   key: fs.readFileSync("./ssl/localhost-privkey.pem"),
          //   cert: fs.readFileSync("./ssl/localhost-cert.pem"),
          // },
          //
          // Uncomment for `http2`
          // createServer: require("node:http2").createSecureServer,
          // serverOptions: {
          //   allowHTTP1: true,
          //   key: require("fs").readFileSync("./ssl/localhost-privkey.pem"),
          //   cert: require("fs").readFileSync("./ssl/localhost-cert.pem"),
          // },
        }),
    },
  },
  import.meta.url,
);

"use strict";

const wdm = require("webpack-dev-middleware");
const { Hono } = require("hono");
const { serve } = require("@hono/node-server");
// eslint-disable-next-line import/extensions, import/no-unresolved
const { serveStatic } = require("@hono/node-server/serve-static");
const { setup } = require("../../util");

// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
module.exports = setup({
  context: __dirname,
  entry: "./app.js",
  devServer: {
    // WARNING:
    //
    // You always need to set up middlewares which you required for your app,
    // built-in middlewares (like `history-api-fallback`/etc) doesn't work by default with `hono`
    setupMiddlewares: (_, devServer) => [
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
      serve({
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
});

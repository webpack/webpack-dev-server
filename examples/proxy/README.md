# proxy

Proxying some URLs can be useful when you have a separate API backend development server and you want to send API requests on the same domain.

**webpack.config.js**

```js
import { once } from "node:events";
import express from "express";

function listenProxyServer() {
  const proxyApp = express();

  proxyApp.get("/proxy", (req, res) => {
    res.send("response from proxy");
  });

  return proxyApp.listen(0, "127.0.0.1");
}

let proxyServer;
let proxyServerReady;

export default {
  // ...
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      proxyServer = listenProxyServer();
      proxyServerReady = once(proxyServer, "listening");
      devServer.server.once("close", () => {
        proxyServer.close();
        proxyServer.closeAllConnections();
      });
      return middlewares;
    },
    proxy: [
      {
        context: "/proxy",
        target: "http://127.0.0.1",
        router: async () => {
          await proxyServerReady;
          const { port } = proxyServer.address();
          return `http://127.0.0.1:${port}`;
        },
      },
    ],
  },
};
```

To run this example use the following command:

```console
npx webpack serve --open
```

## What Should Happen

1. The script starts a backend on an available loopback port and opens `http://localhost:8080/` in your default browser. The example's `router` function directs proxy requests to that backend, avoiding conflicts with services already using port 5000.
2. You should see the text on the page itself change to read `Success! Now visit /proxy`.
3. Now visit the `/proxy` route by clicking on the `/proxy` text, you should see the text on the page itself change to read `response from proxy`.

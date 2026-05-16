import http from "node:http";
import httpProxy from "http-proxy";
// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
import { setup } from "../util.js";

export default setup(
  {
    context: import.meta.dirname,
    entry: "./app.js",
    devServer: {
      webSocketServer: "ws",
      onAfterSetupMiddleware: (server) => {
        const proxyPort = 8080;
        const proxyHost = "127.0.0.1";
        const proxy = httpProxy.createProxyServer({
          target: { socketPath: server.options.ipc },
        });

        const proxyServer = http.createServer((request, response) => {
          // You can define here your custom logic to handle the request
          // and then proxy the request.
          proxy.web(request, response);
        });

        proxyServer.on("upgrade", (request, socket, head) => {
          proxy.ws(request, socket, head);
        });

        proxyServer.listen(proxyPort, proxyHost);
      },
    },
  },
  import.meta.url,
);

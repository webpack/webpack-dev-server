import http from "node:http";
import { createProxyServer } from "httpxy";
// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
import { setup } from "../util.js";

export default setup(
  {
    context: import.meta.dirname,
    entry: "./app.js",
    devServer: {
      ipc: true,
      webSocketServer: "ws",
      onListening: (server) => {
        const proxyPort = 8080;
        const proxyHost = "127.0.0.1";
        const proxy = createProxyServer({
          target: { socketPath: server.options.ipc },
        });

        const proxyServer = http.createServer((request, response) => {
          // You can define here your custom logic to handle the request
          // and then proxy the request.
          proxy.web(request, response).catch(() => {
            response.writeHead(502);
            response.end("Proxy request failed");
          });
        });
        const upgradedSockets = new Set();

        proxyServer.on("upgrade", (request, socket, head) => {
          upgradedSockets.add(socket);
          socket.once("close", () => upgradedSockets.delete(socket));
          proxy
            .ws(request, socket, undefined, head)
            .catch(() => socket.destroy());
        });

        proxyServer.listen(proxyPort, proxyHost);
        server.server.once("close", () => {
          proxyServer.close();
          proxyServer.closeAllConnections();
          for (const socket of upgradedSockets) {
            socket.destroy();
          }
        });
      },
    },
  },
  import.meta.url,
);

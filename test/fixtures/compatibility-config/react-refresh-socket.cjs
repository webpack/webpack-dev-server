// What `@pmmmwh/react-refresh-webpack-plugin` does with webpack-dev-server,
// from its `sockets/WDSSocket.js` (0.6.x), which its default
// `overlay.sockIntegration: "wds"` bundles into every page: take the
// connection the runtime holds and read the build's messages off it.
function init(messageHandler) {
  // eslint-disable-next-line n/no-missing-require
  const { client } = require("webpack-dev-server/client/socket");

  let connection;

  if (client.sock) {
    connection = client.sock;
  } else if (client.client) {
    connection = client.client;
  } else {
    throw new Error("Failed to determine WDS client type");
  }

  connection.addEventListener("message", (message) => {
    messageHandler(JSON.parse(message.data));
  });
}

module.exports = { init };

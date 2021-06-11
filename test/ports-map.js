'use strict';

// test-file-name: the number of ports
// important: new port mappings must be added to the bottom of this list
const portsList = {
  cli: 2,
  sockJSClient: 1,
  SockJSServer: 1,
  'hot-and-live-reload': 1,
  Client: 1,
  ClientOptions: 3,
  logging: 1,
  MultiCompiler: 1,
  UniversalCompiler: 1,
  Server: 1,
  routes: 1,
  'onAfterSetupMiddleware-option': 1,
  'onBeforeSetupMiddleware-option': 1,
  'compress-option': 1,
  'static-directory-option': 1,
  'headers-option': 1,
  'historyApiFallback-option': 1,
  'host-option': 1,
  'hot-option': 1,
  'http2-option': 1,
  'https-option': 1,
  'liveReload-option': 1,
  'mineTypes-option': 1,
  'onListening-option': 1,
  'open-option': 1,
  'port-option': 1,
  'proxy-option': 4,
  'webSocketServer-option': 1,
  'client-option': 1,
  'stats-option': 1,
  ProvidePlugin: 1,
  WebsocketClient: 1,
  WebsocketServer: 1,
  TransportMode: 1,
  Progress: 1,
  Iframe: 1,
  SocketInjection: 1,
  'static-publicPath-option': 1,
  'contentBasePublicPath-option': 1,
  bundle: 1,
  ModuleFederation: 1,
  'setupExitSignals-option': 1,
  'watchFiles-option': 1,
  bonjour: 1,
};

let startPort = 8089;
const ports = {};

Object.keys(portsList).forEach((key) => {
  const value = portsList[key];

  ports[key] =
    value === 1
      ? (startPort += 1)
      : [...new Array(value)].map(() => (startPort += 1));
});

module.exports = ports;

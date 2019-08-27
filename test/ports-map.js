'use strict';

// test-file-name: the number of ports
// important: new port mappings must be added to the bottom of this list
const portsList = {
  cli: 2,
  sockJSClient: 1,
  SockJSServer: 1,
  Client: 1,
  ClientOptions: 3,
  MultiCompiler: 1,
  UniversalCompiler: 1,
  Server: 1,
  routes: 1,
  createDomain: 2,
  'after-option': 1,
  'before-option': 1,
  'compress-option': 1,
  'contentBase-option': 1,
  'headers-option': 1,
  'historyApiFallback-option': 1,
  'host-option': 1,
  'hot-option': 1,
  'hotOnly-option': 1,
  'http2-option': 1,
  'https-option': 1,
  'inline-option': 1,
  'lazy-option': 1,
  'liveReload-option': 1,
  'mineTypes-option': 1,
  'onListening-option': 1,
  'open-option': 1,
  'port-option': 1,
  'proxy-option': 4,
  'transportMode-option': 1,
  'sockPath-option': 1,
  'stats-option': 1,
  ProvidePlugin: 1,
  WebsocketClient: 1,
  WebsocketServer: 1,
  TransportMode: 1,
  Progress: 1,
  'progress-option': 1,
  'profile-option': 1,
  Iframe: 1,
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

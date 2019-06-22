'use strict';

const express = require('express');
const httpProxy = require('http-proxy-middleware');

function startProxy(proxyPort, targetPort, cb) {
  const proxy = express();
  proxy.use(
    '/',
    httpProxy({
      target: `http://localhost:${targetPort}`,
      ws: true,
      changeOrigin: true,
    })
  );
  return proxy.listen(proxyPort, cb);
}

module.exports = startProxy;

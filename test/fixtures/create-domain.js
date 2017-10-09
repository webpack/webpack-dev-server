'use strict';

const internalIp = require('internal-ip');

module.exports = [{
  name: 'default',
  options: {
    host: 'localhost',
    port: 8080
  },
  expected: 'http://localhost:8080'
}, {
  name: 'https',
  options: {
    host: 'localhost',
    port: 8080,
    https: true
  },
  expected: 'https://localhost:8080',
  timeout: 60000
}, {
  name: 'override with public',
  options: {
    host: 'localhost',
    port: 8080,
    public: 'myhost.test'
  },
  expected: 'http://myhost.test'
}, {
  name: 'override with public (port)',
  options: {
    host: 'localhost',
    port: 8080,
    public: 'myhost.test:9090'
  },
  expected: 'http://myhost.test:9090'
}, {
  name: 'override with public (protocol)',
  options: {
    host: 'localhost',
    port: 8080,
    public: 'https://myhost.test'
  },
  expected: 'https://myhost.test'
}, {
  name: 'override with public (protocol + port)',
  options: {
    host: 'localhost',
    port: 8080,
    public: 'https://myhost.test:9090'
  },
  expected: 'https://myhost.test:9090'
}, {
  name: 'localIp',
  options: {
    useLocalIp: true,
    port: 8080
  },
  expected: `http://${internalIp.v4.sync()}:8080`
}];

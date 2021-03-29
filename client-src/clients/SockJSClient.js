'use strict';

const SockJS = require('sockjs-client/dist/sockjs');
const { log } = require('../modules/logger');
const BaseClient = require('./BaseClient');

module.exports = class SockJSClient extends BaseClient {
  constructor(url) {
    super();

    const sockUrl = url.replace(/^(?:chrome-extension|file)/i, 'http');

    this.sock = new SockJS(sockUrl);
    this.sock.onerror = (err) => {
      log.error(err);
    };
  }

  // eslint-disable-next-line no-unused-vars
  static getClientPath(options) {
    return require.resolve('./SockJSClient');
  }

  onOpen(f) {
    this.sock.onopen = f;
  }

  onClose(f) {
    this.sock.onclose = f;
  }

  // call f with the message string as the first argument
  onMessage(f) {
    this.sock.onmessage = (e) => {
      f(e.data);
    };
  }
};

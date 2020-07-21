'use strict';

const SockJS = require('sockjs-client/dist/sockjs');
const { log } = require('../default/utils/log');
const BaseClient = require('./BaseClient');

module.exports = class SockJSClient extends BaseClient {
  constructor(url) {
    super();
    this.sock = new SockJS(url);

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

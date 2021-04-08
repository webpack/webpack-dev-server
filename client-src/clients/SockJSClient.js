'use strict';

const SockJS = require('../modules/sockjs-client');
const { log } = require('../utils/log');
const BaseClient = require('./BaseClient');

module.exports = class SockJSClient extends BaseClient {
  constructor(url) {
    super();

    // SockJS requires `http` and `https` protocols
    this.sock = new SockJS(
      url.replace(/^ws:/i, 'http://').replace(/^wss:/i, 'https://')
    );
    this.sock.onerror = (error) => {
      log.error(error);
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

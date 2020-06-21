'use strict';

/* eslint-disable
  no-unused-vars
*/
const SockJS = require('sockjs-client/dist/sockjs');
const BaseClient = require('./BaseClient');

module.exports = class SockJSClient extends BaseClient {
  constructor(url) {
    super();
    const { log } = require('../default/utils/log');

    this.sock = new SockJS(url);

    this.sock.onerror = (err) => {
      log.error(err);
    };
  }

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

'use strict';

/* eslint-disable
  no-unused-vars
*/
const SockJS = require('sockjs-client/dist/sockjs');
const BaseClient = require('./BaseClient');

module.exports = class SockJSClient extends BaseClient {
  constructor(url) {
    super();
    this.sock = new SockJS(url);

    this.sock.onerror = (err) => {
      // TODO: use logger to log the error event once client and client-src
      // are reorganized to have the same directory structure
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

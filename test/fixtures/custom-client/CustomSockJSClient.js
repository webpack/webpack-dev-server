'use strict';

/* eslint-disable
  no-unused-vars
*/
const SockJS = require('sockjs-client/dist/sockjs');
const BaseClient = require('../../../client/clients/BaseClient');

module.exports = class SockJSClient extends BaseClient {
  constructor(url) {
    super();
    this.sock = new SockJS(url);
  }

  static getClientPath(options) {
    return require.resolve('./CustomSockJSClient');
  }

  onOpen(f) {
    this.sock.onopen = () => {
      console.log('open');
      f();
    };
  }

  onClose(f) {
    this.sock.onclose = () => {
      console.log('close');
      f();
    };
  }

  // call f with the message string as the first argument
  onMessage(f) {
    this.sock.onmessage = (e) => {
      const obj = JSON.parse(e.data);
      console.log(obj.type);
      f(e.data);
    };
  }
};

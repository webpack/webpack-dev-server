'use strict';

/* global WebSocket */

const { log } = require('../default/utils/log');
const BaseClient = require('./BaseClient');

module.exports = class WebsocketClient extends BaseClient {
  constructor(url) {
    super();
    this.client = new WebSocket(
      ((urlToChange) => {
        let wsUrl = urlToChange;
        wsUrl = wsUrl.replace(/^http/, 'ws');
        wsUrl = wsUrl.replace(/^file/, 'ws');
        return wsUrl;
      })(url)
    );

    this.client.onerror = (err) => {
      log.error(err);
    };
  }

  // eslint-disable-next-line no-unused-vars
  static getClientPath(options) {
    return require.resolve('./WebsocketClient');
  }

  onOpen(f) {
    this.client.onopen = f;
  }

  onClose(f) {
    this.client.onclose = f;
  }

  // call f with the message string as the first argument
  onMessage(f) {
    this.client.onmessage = (e) => {
      f(e.data);
    };
  }
};

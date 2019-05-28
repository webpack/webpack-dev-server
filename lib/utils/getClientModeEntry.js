'use strict';

/* eslint-disable
  no-unused-vars
*/

function getClientModeEntry(options) {
  // this is where we can change the source of the client implementation
  // eg. WebsocketClient or a user-provided implementation
  return require.resolve('./../clients/SockJSClient');
}

module.exports = getClientModeEntry;

'use strict';

// 'npm run prepare' must be run for this to work during testing
const WebsocketClient = require('../../../client/clients/WebsocketClient');

window.expectedClient = WebsocketClient;
// eslint-disable-next-line camelcase, no-undef
window.injectedClient = __webpack_dev_server_client__;

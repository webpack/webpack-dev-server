'use strict';

const SockJSClient = require('../../../lib/clients/SockJSClient');

window.expectedClient = SockJSClient;
// eslint-disable-next-line camelcase, no-undef
window.injectedClient = __webpack_dev_server_client__;

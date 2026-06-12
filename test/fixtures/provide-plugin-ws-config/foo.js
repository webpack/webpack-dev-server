// 'npm run prepare' must be run for this to work during testing
import WebsocketClient from "../../../client/clients/WebSocketClient.js";

window.expectedClient = WebsocketClient;
// eslint-disable-next-line camelcase, no-undef
window.injectedClient = __webpack_dev_server_client__.default;

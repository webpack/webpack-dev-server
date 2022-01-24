import SockJS from "../modules/sockjs-client/index.js";
import { log } from "../utils/log.js";

export default class SockJSClient {
  /**
   * @param {string} url
   */
  constructor(url) {
    // SockJS requires `http` and `https` protocols
    this.sock = new SockJS(
      url.replace(/^ws:/i, "http:").replace(/^wss:/i, "https:")
    );
    this.sock.onerror =
      /**
       * @param {Error} error
       */
      (error) => {
        log.error(error);
      };
  }

  /**
   * @param {(...args: any[]) => void} f
   */
  onOpen(f) {
    this.sock.onopen = f;
  }

  /**
   * @param {(...args: any[]) => void} f
   */
  onClose(f) {
    this.sock.onclose = f;
  }

  // call f with the message string as the first argument
  /**
   * @param {(...args: any[]) => void} f
   */
  onMessage(f) {
    this.sock.onmessage =
      /**
       * @param {Error & { data: string }} e
       */
      (e) => {
        f(e.data);
      };
  }
}

import SockJS from "../modules/sockjs-client/index.js";
import { log } from "../utils/log.js";

/** @typedef {import("../index").EXPECTED_ANY} EXPECTED_ANY */

/**
 * @implements {CommunicationClient}
 */
export default class SockJSClient {
  /**
   * @param {string} url url
   */
  constructor(url) {
    // SockJS requires `http` and `https` protocols
    this.sock = new SockJS(
      url.replace(/^ws:/i, "http:").replace(/^wss:/i, "https:"),
    );
    this.sock.onerror = (error) => {
      log.error(error);
    };
  }

  /**
   * @param {(...args: EXPECTED_ANY[]) => void} fn function
   */
  onOpen(fn) {
    this.sock.onopen = fn;
  }

  /**
   * @param {(...args: EXPECTED_ANY[]) => void} fn function
   */
  onClose(fn) {
    this.sock.onclose = fn;
  }

  // call f with the message string as the first argument
  /**
   * @param {(...args: EXPECTED_ANY[]) => void} fn function
   */
  onMessage(fn) {
    this.sock.onmessage = (err) => {
      fn(err.data);
    };
  }
}

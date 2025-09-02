import { log } from "../utils/log.js";

/** @typedef {import("../index").EXPECTED_ANY} EXPECTED_ANY */

/**
 * @implements {CommunicationClient}
 */
export default class WebSocketClient {
  /**
   * @param {string} url url to connect
   */
  constructor(url) {
    this.client = new WebSocket(url);
    this.client.onerror = (error) => {
      log.error(error);
    };
  }

  /**
   * @param {(...args: EXPECTED_ANY[]) => void} fn function
   */
  onOpen(fn) {
    this.client.onopen = fn;
  }

  /**
   * @param {(...args: EXPECTED_ANY[]) => void} fn function
   */
  onClose(fn) {
    this.client.onclose = fn;
  }

  // call f with the message string as the first argument
  /**
   * @param {(...args: EXPECTED_ANY[]) => void} fn function
   */
  onMessage(fn) {
    this.client.onmessage = (err) => {
      fn(err.data);
    };
  }
}

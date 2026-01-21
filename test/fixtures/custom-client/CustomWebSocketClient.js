"use strict";

module.exports = class WebSocketClient {
  constructor(url) {
    this.client = new WebSocket(url);
    this.client.onerror = (error) => {
      console.error(error);
    };
  }

  onOpen(f) {
    this.client.onopen = () => {
      console.log("open");
      f();
    };
  }

  onClose(f) {
    this.client.onclose = () => {
      console.log("close");
      f();
    };
  }

  // call f with the message string as the first argument
  onMessage(f) {
    this.client.onmessage = (e) => {
      const obj = JSON.parse(e.data);
      console.log(obj.type);
      f(e.data);
    };
  }
};

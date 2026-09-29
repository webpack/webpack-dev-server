import "../../helpers/jsdom-setup.js";

import { afterEach, beforeEach, describe, it } from "node:test";
import { expect } from "expect";
import EventSourceClient from "../../../client-src/clients/EventSourceClient.js";

// eslint-disable-next-line jsdoc/reject-any-type
/** @typedef {any} EXPECTED_OBJECT */

/**
 * Stand in for the browser's `EventSource`, driven from the test. Neither Node
 * nor jsdom has one, and a stub is what lets a case play the part a real
 * connection cannot be made to play on demand — a stream that goes quiet
 * without ever failing.
 * @returns {EXPECTED_OBJECT[]} every source built, in order
 */
function fakeEventSource() {
  const instances = [];

  // `self` is what the transport reads: the same object as `window` in a page,
  // and the only one a worker has.
  globalThis.self = {
    EventSource: function EventSource(url) {
      const source = {
        url,
        closed: false,
        listeners: {},
        addEventListener(type, fn) {
          source.listeners[type] = fn;
        },
        close() {
          source.closed = true;
        },
        emit(type, event) {
          if (source.listeners[type]) {
            source.listeners[type](event);
          }
        },
      };

      instances.push(source);

      return source;
    },
  };

  return instances;
}

// The transport itself comes from webpack-dev-middleware, which tests its own
// internals. What is this package's to check is that the module it points
// `client.webSocketTransport: "sse"` at really answers the same contract the
// WebSocket one does, plus the one thing only this transport has: a stream can
// die without the browser saying so, so it watches for silence as well.
describe("EventSourceClient", () => {
  let sources;

  beforeEach(() => {
    sources = fakeEventSource();
  });

  afterEach(() => {
    delete globalThis.self;
  });

  it("connects to the url it was given", () => {
    const client = new EventSourceClient("http://localhost:8080/ws");

    expect(sources).toHaveLength(1);
    expect(sources[0].url).toBe("http://localhost:8080/ws");
    client.close();
  });

  it("reports opening, a message, and a close", () => {
    const client = new EventSourceClient("http://localhost:8080/ws");
    const data = [];

    client.onOpen(() => {
      data.push("open");
    });
    client.onMessage((message) => {
      data.push(message);
    });
    client.onClose(() => {
      data.push("close");
    });

    sources[0].emit("open");
    sources[0].emit("message", { data: "hello world" });
    // There is no `close` event on an `EventSource`; a dropped connection
    // arrives as an `error`, which is the difference this contract hides.
    sources[0].emit("error");

    expect(data).toEqual(["open", "hello world", "close"]);
  });

  it("hands the message on as the string it was sent as", () => {
    const client = new EventSourceClient("http://localhost:8080/ws");
    const seen = [];

    client.onMessage((message) => {
      seen.push(message);
    });

    sources[0].emit("message", { data: '{"type":"ok"}' });

    expect(seen).toEqual(['{"type":"ok"}']);
    client.close();
  });

  it("says nothing after it was closed", () => {
    const client = new EventSourceClient("http://localhost:8080/ws");
    const data = [];

    client.onMessage((message) => {
      data.push(message);
    });
    client.onClose(() => {
      data.push("close");
    });

    client.close();

    // Closing is how `socket.js` gives up. An event the stream had already
    // queued must not come back as a close to reconnect from.
    sources[0].emit("message", { data: "too late" });
    sources[0].emit("error");

    expect(sources[0].closed).toBe(true);
    expect(data).toEqual([]);
  });

  it("reports a close when the stream falls silent", async () => {
    const client = new EventSourceClient("http://localhost:8080/ws", {
      timeout: 60,
    });
    let closed = 0;

    client.onClose(() => {
      closed += 1;
    });

    sources[0].emit("open");

    await new Promise((resolve) => {
      setTimeout(resolve, 250);
    });

    // Nothing failed — the connection simply stopped carrying anything, which
    // is what a proxy that stops forwarding or a laptop that slept looks like.
    // Without this the page would sit on a dead stream forever.
    expect(closed).toBe(1);
    expect(sources[0].closed).toBe(true);
  });

  it("keeps the stream while messages keep arriving", async () => {
    const client = new EventSourceClient("http://localhost:8080/ws", {
      timeout: 120,
    });
    let closed = 0;

    client.onClose(() => {
      closed += 1;
    });

    sources[0].emit("open");

    for (let index = 0; index < 5; index++) {
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
      // What the endpoint's keep-alive is for: it is a `data:` frame rather
      // than a comment precisely so it reaches here and the watchdog above
      // does not fire on an idle but healthy connection.
      sources[0].emit("message", { data: "💓" });
    }

    expect(closed).toBe(0);
    client.close();
  });
});

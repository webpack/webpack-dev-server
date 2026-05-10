"use strict";

const { JSDOM } = require("jsdom");

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "http://localhost/",
  pretendToBeVisual: true,
});

const props = [
  "window",
  "document",
  "navigator",
  "location",
  "history",
  "HTMLElement",
  "Element",
  "Node",
  "Event",
  "CustomEvent",
  "EventTarget",
  "MouseEvent",
  "KeyboardEvent",
  "MessageEvent",
  "ErrorEvent",
  "PromiseRejectionEvent",
  "PageTransitionEvent",
  "ProgressEvent",
  "PopStateEvent",
  "HashChangeEvent",
  "MutationObserver",
  "IntersectionObserver",
  "ResizeObserver",
  "DOMParser",
  "XMLSerializer",
  "FormData",
  "Blob",
  "File",
  "FileReader",
  "URL",
  "URLSearchParams",
  "WebSocket",
  "Worker",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "getComputedStyle",
  "self",
  "postMessage",
  "addEventListener",
  "removeEventListener",
  "dispatchEvent",
  "innerWidth",
  "innerHeight",
  "screen",
  "alert",
  "confirm",
  "prompt",
  "fetch",
  "Headers",
  "Request",
  "Response",
];

for (const prop of props) {
  if (dom.window[prop] === undefined) continue;
  // Bind functions to dom.window so jsdom internals get the right `this`
  // (e.g. addEventListener requires this to be an EventTarget).
  const value =
    typeof dom.window[prop] === "function"
      ? dom.window[prop].bind(dom.window)
      : dom.window[prop];
  Object.defineProperty(globalThis, prop, {
    configurable: true,
    enumerable: true,
    writable: true,
    value,
  });
}

// Match Jest's jsdom-environment behavior: window === self === globalThis.
// (Jest's environment installs everything on the same object; jsdom's
// dom.window is normally separate from Node's globalThis.)
globalThis.window = globalThis;
globalThis.self = globalThis;

// Replace jsdom's stub WebSocket with the Node `ws` library so client-side
// code that does `new WebSocket(url)` actually connects against test servers.
// (Jest's jsdom env did this via `customExportConditions: ["main"]`.)
try {
  globalThis.WebSocket = require("ws");
} catch {
  // ws not installed; leave the jsdom WebSocket as-is.
}

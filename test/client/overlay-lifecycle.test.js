import "../helpers/jsdom-setup.js";

import { afterEach, describe, it } from "node:test";
import { expect } from "expect";
import { fn } from "jest-mock";
import { createOverlay } from "../../client-src/overlay.js";

const buildError = (messages) => ({
  type: "BUILD_ERROR",
  level: "error",
  messages,
});

const loadOverlay = () => {
  const iframe = document.querySelector("#webpack-dev-server-client-overlay");

  expect(iframe).not.toBeNull();
  iframe.onload();

  return iframe;
};

describe("overlay lifecycle", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    document.body.innerHTML = "";
    globalThis.fetch = originalFetch;
    delete globalThis.trustedTypes;
  });

  it("renders only the latest complete message list while loading", () => {
    const overlay = createOverlay({});

    overlay.send(buildError(["first error"]));
    overlay.send(buildError(["second error"]));

    const iframe = loadOverlay();
    const text = iframe.contentDocument.body.textContent;

    expect(text).toContain("first error");
    expect(text).toContain("second error");
    expect(text.match(/first error/g)).toHaveLength(1);
    expect(text.match(/second error/g)).toHaveLength(1);

    overlay.send({ type: "DISMISS" });
  });

  it("discards a pending render when dismissed and supports reopening", () => {
    const overlay = createOverlay({});

    overlay.send(buildError(["stale error"]));
    const staleIframe = document.querySelector(
      "#webpack-dev-server-client-overlay",
    );

    overlay.send({ type: "DISMISS" });
    expect(staleIframe.onload).toBeNull();
    expect(document.body.contains(staleIframe)).toBe(false);

    overlay.send(buildError(["current error"]));
    const iframe = loadOverlay();
    expect(iframe.contentDocument.body.textContent).toContain("current error");

    iframe.contentDocument.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape" }),
    );
    expect(document.body.contains(iframe)).toBe(false);
  });

  it("reuses its Trusted Types policy and encodes editor paths", () => {
    const createPolicy = fn(() => ({ createHTML: (value) => value }));
    globalThis.trustedTypes = { createPolicy };
    const fetchMock = fn(() => Promise.resolve());
    globalThis.fetch = fetchMock;
    const overlay = createOverlay({ trustedTypesPolicyName: "overlay-policy" });
    const message = {
      message: "broken",
      moduleIdentifier: "src/a&b.js",
    };

    overlay.send(buildError([message]));
    let iframe = loadOverlay();
    iframe.contentDocument.querySelector("[data-can-open]").click();

    expect(fetchMock).toHaveBeenCalledWith(
      "/webpack-dev-server/open-editor?fileName=src%2Fa%26b.js",
    );

    overlay.send({ type: "DISMISS" });
    overlay.send(buildError([message]));
    iframe = loadOverlay();

    expect(createPolicy).toHaveBeenCalledTimes(1);
    overlay.send({ type: "DISMISS" });
  });
});

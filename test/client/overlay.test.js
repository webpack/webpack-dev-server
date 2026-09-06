import "../helpers/jsdom-setup.js";

import { afterEach, describe, it } from "node:test";
import { expect } from "expect";
import { clear, showProblems } from "webpack-dev-middleware/client/overlay";
import { createOverlay } from "../../client-src/overlay.js";

const selector = "#webpack-dev-middleware-hot-overlay";

describe("shared overlay", () => {
  afterEach(() => clear());

  it("should render compiler messages safely and link files to the editor", () => {
    const overlay = createOverlay({ catchRuntimeError: false });
    overlay.send({
      type: "BUILD_ERROR",
      level: "error",
      messages: [
        {
          moduleName: "./src/app.js",
          moduleIdentifier: "javascript/esm|/project/src/app.js",
          loc: "2:3",
          message: "<script>bad()</script>",
        },
      ],
    });
    const frame = globalThis.document.querySelector(selector);
    const document = frame.contentDocument;
    expect(document.querySelector("script")).toBeNull();
    expect(document.querySelector("[data-open-file]").dataset.openFile).toBe(
      "/project/src/app.js:2:3",
    );
    expect(document.body.textContent).toContain("<script>bad()</script>");
    overlay.send({ type: "DISMISS" });
    expect(globalThis.document.querySelector(selector)).toBeNull();
  });

  it("should preserve problems reported by another client on a clean build", () => {
    showProblems("errors", ["Other client error"], "other-client");
    const overlay = createOverlay({ catchRuntimeError: false });
    overlay.send({
      type: "BUILD_ERROR",
      level: "error",
      messages: ["Server error"],
    });
    expect(document.querySelectorAll(selector)).toHaveLength(1);
    overlay.send({ type: "DISMISS" });
    expect(
      document.querySelector(selector).contentDocument.body.textContent,
    ).toContain("Other client error");
    expect(
      document.querySelector(selector).contentDocument.body.textContent,
    ).not.toContain("Server error");
  });
});

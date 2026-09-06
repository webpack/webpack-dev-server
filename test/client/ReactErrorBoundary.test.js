import "../helpers/jsdom-setup.js";

import { afterEach, describe, it } from "node:test";
import { expect } from "expect";
import { clear } from "webpack-dev-middleware/client/overlay";
import { createOverlay } from "../../client-src/overlay.js";

describe("createOverlay", () => {
  const selector = "#webpack-dev-middleware-hot-overlay";
  afterEach(() => clear());

  it("should not show overlay for errors caught by React error boundaries", () => {
    const options = { trustedTypesPolicyName: null, catchRuntimeError: true };
    createOverlay(options);

    const reactError = new Error(
      "Error inside React render\n" +
        "    at Boom (webpack:///./src/index.jsx?:41:11)\n" +
        "    at renderWithHooks (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16305:18)\n" +
        "    at mountIndeterminateComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:20069:13)\n" +
        "    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:21582:16)\n" +
        "    at HTMLUnknownElement.callCallback (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:4164:14)\n" +
        "    at Object.invokeGuardedCallbackDev (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:4213:16)\n" +
        "    at invokeGuardedCallback (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:4277:31)\n" +
        "    at beginWork$1 (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:27446:7)\n" +
        "    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:26555:12)\n" +
        "    at workLoopSync (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:26461:5)",
    );
    reactError._suppressLogging = true;

    const errorEvent = new ErrorEvent("error", {
      error: reactError,
      message: reactError.message,
    });
    globalThis.dispatchEvent(errorEvent);

    expect(document.querySelector(selector)).toBeNull();
  });

  it("should show overlay for normal uncaught errors", () => {
    const options = { trustedTypesPolicyName: null, catchRuntimeError: true };
    createOverlay(options);

    const regularError = new Error(
      "Error inside React render\n" +
        "    at Boom (webpack:///./src/index.jsx?:41:11)\n" +
        "    at renderWithHooks (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16305:18)\n" +
        "    at mountIndeterminateComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:20069:13)\n" +
        "    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:21582:16)\n" +
        "    at HTMLUnknownElement.callCallback (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:4164:14)\n",
    );

    const errorEvent = new ErrorEvent("error", {
      error: regularError,
      message: "Regular test error message",
    });
    globalThis.dispatchEvent(errorEvent);

    expect(
      document.querySelector(selector).contentDocument.body.textContent,
    ).toContain(regularError.message);
  });

  it("should show overlay for normal uncaught errors (when null is thrown)", () => {
    const options = { trustedTypesPolicyName: null, catchRuntimeError: true };
    createOverlay(options);

    const errorEvent = new ErrorEvent("error", {
      error: null,
      message: "error",
    });
    globalThis.dispatchEvent(errorEvent);

    expect(
      document.querySelector(selector).contentDocument.body.textContent,
    ).toContain("error");
  });

  it("should show overlay for normal uncaught errors when catchRuntimeError is a function that return true", () => {
    const options = {
      trustedTypesPolicyName: null,
      catchRuntimeError: () => true,
    };
    createOverlay(options);

    const regularError = new Error("Regular test error");
    const errorEvent = new ErrorEvent("error", {
      error: regularError,
      message: "Regular test error message",
    });
    globalThis.dispatchEvent(errorEvent);

    expect(
      document.querySelector(selector).contentDocument.body.textContent,
    ).toContain(regularError.message);
  });

  it("should not show overlay for normal uncaught errors when catchRuntimeError is a function that return false", () => {
    const options = {
      trustedTypesPolicyName: null,
      catchRuntimeError: () => false,
    };
    createOverlay(options);

    const regularError = new Error("Regular test error");
    const errorEvent = new ErrorEvent("error", {
      error: regularError,
      message: "Regular test error message",
    });
    globalThis.dispatchEvent(errorEvent);

    expect(document.querySelector(selector)).toBeNull();
  });

  it("should not show the overlay for errors with stack containing 'invokeGuardedCallbackDev'", () => {
    const options = { trustedTypesPolicyName: null, catchRuntimeError: true };
    createOverlay(options);

    const reactInternalError = new Error("React internal error");
    reactInternalError.stack = "invokeGuardedCallbackDev\n at somefile.js";
    const errorEvent = new ErrorEvent("error", {
      error: reactInternalError,
      message: "React internal error",
    });
    globalThis.dispatchEvent(errorEvent);

    expect(document.querySelector(selector)).toBeNull();
  });

  it("should show overlay for unhandled rejections", () => {
    const options = { trustedTypesPolicyName: null, catchRuntimeError: true };
    createOverlay(options);

    const rejectionReason = new Error("Promise rejection reason");
    const rejectionEvent = new Event("unhandledrejection");
    rejectionEvent.reason = rejectionReason;

    globalThis.dispatchEvent(rejectionEvent);

    expect(
      document.querySelector(selector).contentDocument.body.textContent,
    ).toContain(rejectionReason.message);
  });

  it("should show overlay for unhandled rejections with string reason", () => {
    const options = { trustedTypesPolicyName: null, catchRuntimeError: true };
    createOverlay(options);
    const rejectionEvent = new Event("unhandledrejection");
    rejectionEvent.reason = "some reason";
    globalThis.dispatchEvent(rejectionEvent);

    expect(
      document.querySelector(selector).contentDocument.body.textContent,
    ).toContain("some reason");
  });
  for (const target of ["page", "frame"]) {
    it(`should dismiss the overlay with Escape from the ${target}`, () => {
      const overlay = createOverlay({ catchRuntimeError: true });
      overlay.send({
        type: "BUILD_ERROR",
        level: "error",
        messages: ["Build failed"],
      });
      const frame = document.querySelector(selector);
      const targetDocument =
        target === "page" ? document : frame.contentDocument;
      targetDocument.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape" }),
      );
      expect(document.querySelector(selector)).toBeNull();
    });
  }

  it("should preserve the cause of a rejected value for runtime error filters", () => {
    const reason = { error: new Error("Rejected object") };
    let received;
    createOverlay({
      catchRuntimeError: (error) => {
        received = error;
        return false;
      },
    });
    const event = new Event("unhandledrejection");
    event.reason = reason;
    globalThis.dispatchEvent(event);
    expect(received.cause).toBe(reason);
    expect(document.querySelector(selector)).toBeNull();
  });

  it("should stop displaying runtime errors when capture is disabled", () => {
    createOverlay({ catchRuntimeError: true });
    createOverlay({ catchRuntimeError: false });
    globalThis.dispatchEvent(
      new ErrorEvent("error", { error: new Error("Ignored") }),
    );
    expect(document.querySelector(selector)).toBeNull();
  });

  it("should clear runtime problems on the next build", () => {
    const overlay = createOverlay({ catchRuntimeError: true });
    globalThis.dispatchEvent(
      new ErrorEvent("error", { error: new Error("Runtime failure") }),
    );
    expect(document.querySelector(selector)).not.toBeNull();
    overlay.send({ type: "DISMISS" });
    expect(document.querySelector(selector)).toBeNull();
  });
});

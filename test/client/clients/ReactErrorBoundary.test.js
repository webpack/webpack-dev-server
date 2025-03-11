/**
 * @jest-environment jsdom
 */

"use strict";

const { createOverlay } = require("../../../client-src/overlay");

describe("createOverlay", () => {
  const originalDocument = global.document;
  const originalWindow = global.window;

  beforeEach(() => {
    global.document = {
      createElement: jest.fn(() => {return {
        style: {},
        appendChild: jest.fn(),
        addEventListener: jest.fn(),
        contentDocument: {
          createElement: jest.fn(() => {return { style: {}, appendChild: jest.fn() }}),
          body: { appendChild: jest.fn() },
        },
      }}),
      body: { appendChild: jest.fn(), removeChild: jest.fn() },
    };
    global.window = {
      // Keep addEventListener mocked for other potential uses
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      // Mock trustedTypes
      trustedTypes: null,
      // Mock dispatchEvent
      dispatchEvent: jest.fn(),
    };
    jest.useFakeTimers();
  });

  afterEach(() => {
    global.document = originalDocument;
    global.window = originalWindow;
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("should not show overlay for errors caught by React error boundaries", () => {
    const options = { trustedTypesPolicyName: null, catchRuntimeError: true };
    const overlay = createOverlay(options);
    const showOverlayMock = jest.spyOn(overlay, "send");

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
    window.dispatchEvent(errorEvent);

    expect(showOverlayMock).not.toHaveBeenCalled();
    showOverlayMock.mockRestore();
  });

  it("should show overlay for normal uncaught errors", () => {
    const options = { trustedTypesPolicyName: null, catchRuntimeError: true };
    const overlay = createOverlay(options);
    const showOverlayMock = jest.spyOn(overlay, "send");

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
    window.dispatchEvent(errorEvent);

    expect(showOverlayMock).toHaveBeenCalledWith({
      type: "RUNTIME_ERROR",
      messages: [
        {
          message: regularError.message,
          stack: expect.anything(),
        },
      ],
    });
    showOverlayMock.mockRestore();
  });

  it("should show overlay for normal uncaught errors when catchRuntimeError is a function that return true", () => {
    const options = {
      trustedTypesPolicyName: null,
      catchRuntimeError: () => true,
    };
    const overlay = createOverlay(options);
    const showOverlayMock = jest.spyOn(overlay, "send");

    const regularError = new Error("Regular test error");
    const errorEvent = new ErrorEvent("error", {
      error: regularError,
      message: "Regular test error message",
    });
    window.dispatchEvent(errorEvent);

    expect(showOverlayMock).toHaveBeenCalledWith({
      type: "RUNTIME_ERROR",
      messages: [
        {
          message: regularError.message,
          stack: expect.anything(),
        },
      ],
    });
    showOverlayMock.mockRestore();
  });

  it("should not show overlay for normal uncaught errors when catchRuntimeError is a function that return false", () => {
    const options = {
      trustedTypesPolicyName: null,
      catchRuntimeError: () => false,
    };
    const overlay = createOverlay(options);
    const showOverlayMock = jest.spyOn(overlay, "send");

    const regularError = new Error("Regular test error");
    const errorEvent = new ErrorEvent("error", {
      error: regularError,
      message: "Regular test error message",
    });
    window.dispatchEvent(errorEvent);

    expect(showOverlayMock).not.toHaveBeenCalled();
    showOverlayMock.mockRestore();
  });

  it("should not show the overlay for errors with stack containing 'invokeGuardedCallbackDev'", () => {
    const options = { trustedTypesPolicyName: null, catchRuntimeError: true };
    const overlay = createOverlay(options);
    const showOverlayMock = jest.spyOn(overlay, "send");

    const reactInternalError = new Error("React internal error");
    reactInternalError.stack = "invokeGuardedCallbackDev\n at somefile.js";
    const errorEvent = new ErrorEvent("error", {
      error: reactInternalError,
      message: "React internal error",
    });
    window.dispatchEvent(errorEvent);

    expect(showOverlayMock).not.toHaveBeenCalled();
    showOverlayMock.mockRestore();
  });

  it("should show overlay for unhandled rejections", () => {
    const options = { trustedTypesPolicyName: null, catchRuntimeError: true };
    const overlay = createOverlay(options);
    const showOverlayMock = jest.spyOn(overlay, "send");

    const rejectionReason = new Error("Promise rejection reason");
    const rejectionEvent = new Event("unhandledrejection");
    rejectionEvent.reason = rejectionReason;

    window.dispatchEvent(rejectionEvent);

    expect(showOverlayMock).toHaveBeenCalledWith({
      type: "RUNTIME_ERROR",
      messages: [
        {
          message: rejectionReason.message,
          stack: expect.anything(),
        },
      ],
    });
    showOverlayMock.mockRestore();
  });

  it("should show overlay for unhandled rejections with string reason", () => {
    const options = { trustedTypesPolicyName: null, catchRuntimeError: true };
    const overlay = createOverlay(options);
    const showOverlayMock = jest.spyOn(overlay, "send");
    const rejectionEvent = new Event("unhandledrejection");
    rejectionEvent.reason = "some reason";
    window.dispatchEvent(rejectionEvent);

    expect(showOverlayMock).toHaveBeenCalledWith({
      type: "RUNTIME_ERROR",
      messages: [
        {
          message: "some reason",
          stack: expect.anything(),
        },
      ],
    });
    showOverlayMock.mockRestore();
  });
});

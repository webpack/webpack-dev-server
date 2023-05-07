// The error overlay is inspired (and mostly copied) from Create React App (https://github.com/facebookincubator/create-react-app)
// They, in turn, got inspired by webpack-hot-middleware (https://github.com/glenjamin/webpack-hot-middleware).

import ansiHTML from "ansi-html-community";
import { encode } from "html-entities";
import {
  listenToRuntimeError,
  listenToUnhandledRejection,
  parseErrorToStacks,
} from "./overlay/runtime-error.js";
import createOverlayMachine from "./overlay/state-machine.js";
import {
  containerStyle,
  dismissButtonStyle,
  headerStyle,
  iframeStyle,
  msgStyles,
  msgTextStyle,
  msgTypeStyle,
} from "./overlay/styles.js";

const colors = {
  reset: ["transparent", "transparent"],
  black: "181818",
  red: "E36049",
  green: "B3CB74",
  yellow: "FFD080",
  blue: "7CAFC2",
  magenta: "7FACCA",
  cyan: "C3C2EF",
  lightgrey: "EBE7E3",
  darkgrey: "6D7891",
};

ansiHTML.setColors(colors);

/**
 * @param {string} type
 * @param {string  | { file?: string, moduleName?: string, loc?: string, message?: string; stack?: string[] }} item
 * @returns {{ header: string, body: string }}
 */
function formatProblem(type, item) {
  let header = type === "warning" ? "WARNING" : "ERROR";
  let body = "";

  if (typeof item === "string") {
    body += item;
  } else {
    const file = item.file || "";
    // eslint-disable-next-line no-nested-ternary
    const moduleName = item.moduleName
      ? item.moduleName.indexOf("!") !== -1
        ? `${item.moduleName.replace(/^(\s|\S)*!/, "")} (${item.moduleName})`
        : `${item.moduleName}`
      : "";
    const loc = item.loc;

    header += `${
      moduleName || file
        ? ` in ${
            moduleName ? `${moduleName}${file ? ` (${file})` : ""}` : file
          }${loc ? ` ${loc}` : ""}`
        : ""
    }`;
    body += item.message || "";
  }

  if (Array.isArray(item.stack)) {
    item.stack.forEach((stack) => {
      if (typeof stack === "string") {
        body += `\r\n${stack}`;
      }
    });
  }

  return { header, body };
}

/**
 * @typedef {Object} CreateOverlayOptions
 * @property {string | null} trustedTypesPolicyName
 * @property {boolean | (error: Error) => void} [catchRuntimeError]
 */

/**
 *
 * @param {CreateOverlayOptions} options
 */
const createOverlay = (options) => {
  /** @type {HTMLIFrameElement | null | undefined} */
  let iframeContainerElement;
  /** @type {HTMLDivElement | null | undefined} */
  let containerElement;
  /** @type {HTMLDivElement | null | undefined} */
  let headerElement;
  /** @type {Array<(element: HTMLDivElement) => void>} */
  let onLoadQueue = [];
  /** @type {TrustedTypePolicy | undefined} */
  let overlayTrustedTypesPolicy;

  /**
   *
   * @param {HTMLElement} element
   * @param {CSSStyleDeclaration} style
   */
  function applyStyle(element, style) {
    Object.keys(style).forEach((prop) => {
      element.style[prop] = style[prop];
    });
  }

  /**
   * @param {string | null} trustedTypesPolicyName
   */
  function createContainer(trustedTypesPolicyName) {
    // Enable Trusted Types if they are available in the current browser.
    if (window.trustedTypes) {
      overlayTrustedTypesPolicy = window.trustedTypes.createPolicy(
        trustedTypesPolicyName || "webpack-dev-server#overlay",
        {
          createHTML: (value) => value,
        }
      );
    }

    iframeContainerElement = document.createElement("iframe");
    iframeContainerElement.id = "webpack-dev-server-client-overlay";
    iframeContainerElement.src = "about:blank";
    applyStyle(iframeContainerElement, iframeStyle);

    iframeContainerElement.onload = () => {
      const contentElement =
        /** @type {Document} */
        (
          /** @type {HTMLIFrameElement} */
          (iframeContainerElement).contentDocument
        ).createElement("div");
      containerElement =
        /** @type {Document} */
        (
          /** @type {HTMLIFrameElement} */
          (iframeContainerElement).contentDocument
        ).createElement("div");

      contentElement.id = "webpack-dev-server-client-overlay-div";
      applyStyle(contentElement, containerStyle);

      headerElement = document.createElement("div");

      headerElement.innerText = "Compiled with problems:";
      applyStyle(headerElement, headerStyle);

      const closeButtonElement = document.createElement("button");

      applyStyle(closeButtonElement, dismissButtonStyle);

      closeButtonElement.innerText = "×";
      closeButtonElement.ariaLabel = "Dismiss";
      closeButtonElement.addEventListener("click", () => {
        // eslint-disable-next-line no-use-before-define
        overlayService.send({ type: "DISMISS" });
      });

      contentElement.appendChild(headerElement);
      contentElement.appendChild(closeButtonElement);
      contentElement.appendChild(containerElement);

      /** @type {Document} */
      (
        /** @type {HTMLIFrameElement} */
        (iframeContainerElement).contentDocument
      ).body.appendChild(contentElement);

      onLoadQueue.forEach((onLoad) => {
        onLoad(/** @type {HTMLDivElement} */ (contentElement));
      });
      onLoadQueue = [];

      /** @type {HTMLIFrameElement} */
      (iframeContainerElement).onload = null;
    };

    document.body.appendChild(iframeContainerElement);
  }

  /**
   * @param {(element: HTMLDivElement) => void} callback
   * @param {string | null} trustedTypesPolicyName
   */
  function ensureOverlayExists(callback, trustedTypesPolicyName) {
    if (containerElement) {
      containerElement.innerHTML = "";
      // Everything is ready, call the callback right away.
      callback(containerElement);

      return;
    }

    onLoadQueue.push(callback);

    if (iframeContainerElement) {
      return;
    }

    createContainer(trustedTypesPolicyName);
  }

  // Successful compilation.
  function hide() {
    if (!iframeContainerElement) {
      return;
    }

    // Clean up and reset internal state.
    document.body.removeChild(iframeContainerElement);

    iframeContainerElement = null;
    containerElement = null;
  }

  // Compilation with errors (e.g. syntax error or missing modules).
  /**
   * @param {string} type
   * @param {Array<string  | { moduleIdentifier?: string, moduleName?: string, loc?: string, message?: string }>} messages
   * @param {string | null} trustedTypesPolicyName
   * @param {'build' | 'runtime'} messageSource
   */
  function show(type, messages, trustedTypesPolicyName, messageSource) {
    ensureOverlayExists(() => {
      headerElement.innerText =
        messageSource === "runtime"
          ? "Uncaught runtime errors:"
          : "Compiled with problems:";

      messages.forEach((message) => {
        const entryElement = document.createElement("div");
        const msgStyle =
          type === "warning" ? msgStyles.warning : msgStyles.error;
        applyStyle(entryElement, {
          ...msgStyle,
          padding: "1rem 1rem 1.5rem 1rem",
        });

        const typeElement = document.createElement("div");
        const { header, body } = formatProblem(type, message);

        typeElement.innerText = header;
        applyStyle(typeElement, msgTypeStyle);

        if (message.moduleIdentifier) {
          applyStyle(typeElement, { cursor: "pointer" });
          // element.dataset not supported in IE
          typeElement.setAttribute("data-can-open", true);
          typeElement.addEventListener("click", () => {
            fetch(
              `/webpack-dev-server/open-editor?fileName=${message.moduleIdentifier}`
            );
          });
        }

        // Make it look similar to our terminal.
        const text = ansiHTML(encode(body));
        const messageTextNode = document.createElement("div");
        applyStyle(messageTextNode, msgTextStyle);

        messageTextNode.innerHTML = overlayTrustedTypesPolicy
          ? overlayTrustedTypesPolicy.createHTML(text)
          : text;

        entryElement.appendChild(typeElement);
        entryElement.appendChild(messageTextNode);

        /** @type {HTMLDivElement} */
        (containerElement).appendChild(entryElement);
      });
    }, trustedTypesPolicyName);
  }

  const overlayService = createOverlayMachine({
    showOverlay: ({ level = "error", messages, messageSource }) =>
      show(level, messages, options.trustedTypesPolicyName, messageSource),
    hideOverlay: hide,
  });

  if (options.catchRuntimeError) {
    /**
     * @param {Error | undefined} error
     * @param {string} fallbackMessage
     */
    const handleError = (error, fallbackMessage) => {
      const errorObject =
        error instanceof Error ? error : new Error(error || fallbackMessage);

      const shouldDisplay =
        typeof options.catchRuntimeError === "function"
          ? options.catchRuntimeError(errorObject)
          : true;

      if (shouldDisplay) {
        overlayService.send({
          type: "RUNTIME_ERROR",
          messages: [
            {
              message: errorObject.message,
              stack: parseErrorToStacks(errorObject),
            },
          ],
        });
      }
    };

    listenToRuntimeError((errorEvent) => {
      // error property may be empty in older browser like IE
      const { error, message } = errorEvent;

      if (!error && !message) {
        return;
      }

      handleError(error, message);
    });

    listenToUnhandledRejection((promiseRejectionEvent) => {
      const { reason } = promiseRejectionEvent;

      handleError(reason, "Unknown promise rejection reason");
    });
  }

  return overlayService;
};

export { formatProblem, createOverlay };

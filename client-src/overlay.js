// The error overlay is inspired (and mostly copied) from Create React App (https://github.com/facebookincubator/create-react-app)
// They, in turn, got inspired by webpack-hot-middleware (https://github.com/glenjamin/webpack-hot-middleware).

import ansiHTML from "ansi-html-community";

/**
 * @type {(input: string, position: number) => string}
 */
const getCodePoint = String.prototype.codePointAt
  ? (input, position) => input.codePointAt(position)
  : (input, position) =>
      (input.charCodeAt(position) - 0xd800) * 0x400 +
      input.charCodeAt(position + 1) -
      0xdc00 +
      0x10000;

/**
 * @param {string} macroText
 * @param {RegExp} macroRegExp
 * @param {(input: string) => string} macroReplacer
 * @returns {string}
 */
const replaceUsingRegExp = (macroText, macroRegExp, macroReplacer) => {
  macroRegExp.lastIndex = 0;
  let replaceMatch = macroRegExp.exec(macroText);
  let replaceResult;
  if (replaceMatch) {
    replaceResult = "";
    let replaceLastIndex = 0;
    do {
      if (replaceLastIndex !== replaceMatch.index) {
        replaceResult += macroText.substring(
          replaceLastIndex,
          replaceMatch.index,
        );
      }
      const replaceInput = replaceMatch[0];
      replaceResult += macroReplacer(replaceInput);
      replaceLastIndex = replaceMatch.index + replaceInput.length;
      // eslint-disable-next-line no-cond-assign
    } while ((replaceMatch = macroRegExp.exec(macroText)));

    if (replaceLastIndex !== macroText.length) {
      replaceResult += macroText.substring(replaceLastIndex);
    }
  } else {
    replaceResult = macroText;
  }
  return replaceResult;
};

const references = {
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
  "&": "&amp;",
};

/**
 * @param {string} text text
 * @returns {string}
 */
function encode(text) {
  if (!text) {
    return "";
  }

  return replaceUsingRegExp(text, /[<>'"&]/g, (input) => {
    let result = references[input];
    if (!result) {
      const code =
        input.length > 1 ? getCodePoint(input, 0) : input.charCodeAt(0);
      result = `&#${code};`;
    }
    return result;
  });
}

/**
 * @typedef {Object} StateDefinitions
 * @property {{[event: string]: { target: string; actions?: Array<string> }}} [on]
 */

/**
 * @typedef {Object} Options
 * @property {{[state: string]: StateDefinitions}} states
 * @property {object} context;
 * @property {string} initial
 */

/**
 * @typedef {Object} Implementation
 * @property {{[actionName: string]: (ctx: object, event: any) => object}} actions
 */

/**
 * A simplified `createMachine` from `@xstate/fsm` with the following differences:
 *
 *  - the returned machine is technically a "service". No `interpret(machine).start()` is needed.
 *  - the state definition only support `on` and target must be declared with { target: 'nextState', actions: [] } explicitly.
 *  - event passed to `send` must be an object with `type` property.
 *  - actions implementation will be [assign action](https://xstate.js.org/docs/guides/context.html#assign-action) if you return any value.
 *  Do not return anything if you just want to invoke side effect.
 *
 * The goal of this custom function is to avoid installing the entire `'xstate/fsm'` package, while enabling modeling using
 * state machine. You can copy the first parameter into the editor at https://stately.ai/viz to visualize the state machine.
 *
 * @param {Options} options
 * @param {Implementation} implementation
 */
function createMachine({ states, context, initial }, { actions }) {
  let currentState = initial;
  let currentContext = context;

  return {
    send: (event) => {
      const currentStateOn = states[currentState].on;
      const transitionConfig = currentStateOn && currentStateOn[event.type];

      if (transitionConfig) {
        currentState = transitionConfig.target;
        if (transitionConfig.actions) {
          transitionConfig.actions.forEach((actName) => {
            const actionImpl = actions[actName];

            const nextContextValue =
              actionImpl && actionImpl(currentContext, event);

            if (nextContextValue) {
              currentContext = {
                ...currentContext,
                ...nextContextValue,
              };
            }
          });
        }
      }
    },
  };
}

/**
 * @typedef {Object} ShowOverlayData
 * @property {'warning' | 'error'} level
 * @property {Array<string  | { moduleIdentifier?: string, moduleName?: string, loc?: string, message?: string }>} messages
 * @property {'build' | 'runtime'} messageSource
 */

/**
 * @typedef {Object} CreateOverlayMachineOptions
 * @property {(data: ShowOverlayData) => void} showOverlay
 * @property {() => void} hideOverlay
 */

/**
 * @param {CreateOverlayMachineOptions} options
 */
const createOverlayMachine = (options) => {
  const { hideOverlay, showOverlay } = options;

  return createMachine(
    {
      initial: "hidden",
      context: {
        level: "error",
        messages: [],
        messageSource: "build",
      },
      states: {
        hidden: {
          on: {
            BUILD_ERROR: {
              target: "displayBuildError",
              actions: ["setMessages", "showOverlay"],
            },
            RUNTIME_ERROR: {
              target: "displayRuntimeError",
              actions: ["setMessages", "showOverlay"],
            },
          },
        },
        displayBuildError: {
          on: {
            DISMISS: {
              target: "hidden",
              actions: ["dismissMessages", "hideOverlay"],
            },
            BUILD_ERROR: {
              target: "displayBuildError",
              actions: ["appendMessages", "showOverlay"],
            },
          },
        },
        displayRuntimeError: {
          on: {
            DISMISS: {
              target: "hidden",
              actions: ["dismissMessages", "hideOverlay"],
            },
            RUNTIME_ERROR: {
              target: "displayRuntimeError",
              actions: ["appendMessages", "showOverlay"],
            },
            BUILD_ERROR: {
              target: "displayBuildError",
              actions: ["setMessages", "showOverlay"],
            },
          },
        },
      },
    },
    {
      actions: {
        dismissMessages: () => {
          return {
            messages: [],
            level: "error",
            messageSource: "build",
          };
        },
        appendMessages: (context, event) => {
          return {
            messages: context.messages.concat(event.messages),
            level: event.level || context.level,
            messageSource: event.type === "RUNTIME_ERROR" ? "runtime" : "build",
          };
        },
        setMessages: (context, event) => {
          return {
            messages: event.messages,
            level: event.level || context.level,
            messageSource: event.type === "RUNTIME_ERROR" ? "runtime" : "build",
          };
        },
        hideOverlay,
        showOverlay,
      },
    },
  );
};

/**
 *
 * @param {Error} error
 */
const parseErrorToStacks = (error) => {
  if (!error || !(error instanceof Error)) {
    throw new Error(`parseErrorToStacks expects Error object`);
  }
  if (typeof error.stack === "string") {
    return error.stack
      .split("\n")
      .filter((stack) => stack !== `Error: ${error.message}`);
  }
};

/**
 * @callback ErrorCallback
 * @param {ErrorEvent} error
 * @returns {void}
 */

/**
 * @param {ErrorCallback} callback
 */
const listenToRuntimeError = (callback) => {
  window.addEventListener("error", callback);

  return function cleanup() {
    window.removeEventListener("error", callback);
  };
};

/**
 * @callback UnhandledRejectionCallback
 * @param {PromiseRejectionEvent} rejectionEvent
 * @returns {void}
 */

/**
 * @param {UnhandledRejectionCallback} callback
 */
const listenToUnhandledRejection = (callback) => {
  window.addEventListener("unhandledrejection", callback);

  return function cleanup() {
    window.removeEventListener("unhandledrejection", callback);
  };
};

// Styles are inspired by `react-error-overlay`

const msgStyles = {
  error: {
    backgroundColor: "rgba(206, 17, 38, 0.1)",
    color: "#fccfcf",
  },
  warning: {
    backgroundColor: "rgba(251, 245, 180, 0.1)",
    color: "#fbf5b4",
  },
};
const iframeStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: "100vw",
  height: "100vh",
  border: "none",
  "z-index": 9999999999,
};
const containerStyle = {
  position: "fixed",
  boxSizing: "border-box",
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  width: "100vw",
  height: "100vh",
  fontSize: "large",
  padding: "2rem 2rem 4rem 2rem",
  lineHeight: "1.2",
  whiteSpace: "pre-wrap",
  overflow: "auto",
  backgroundColor: "rgba(0, 0, 0, 0.9)",
  color: "white",
};
const headerStyle = {
  color: "#e83b46",
  fontSize: "2em",
  whiteSpace: "pre-wrap",
  fontFamily: "sans-serif",
  margin: "0 2rem 2rem 0",
  flex: "0 0 auto",
  maxHeight: "50%",
  overflow: "auto",
};
const dismissButtonStyle = {
  color: "#ffffff",
  lineHeight: "1rem",
  fontSize: "1.5rem",
  padding: "1rem",
  cursor: "pointer",
  position: "absolute",
  right: 0,
  top: 0,
  backgroundColor: "transparent",
  border: "none",
};
const msgTypeStyle = {
  color: "#e83b46",
  fontSize: "1.2em",
  marginBottom: "1rem",
  fontFamily: "sans-serif",
};
const msgTextStyle = {
  lineHeight: "1.5",
  fontSize: "1rem",
  fontFamily: "Menlo, Consolas, monospace",
};

// ANSI HTML

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
const formatProblem = (type, item) => {
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
};

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
        },
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
      containerElement.innerHTML = overlayTrustedTypesPolicy
        ? overlayTrustedTypesPolicy.createHTML("")
        : "";
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
              `/webpack-dev-server/open-editor?fileName=${message.moduleIdentifier}`,
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

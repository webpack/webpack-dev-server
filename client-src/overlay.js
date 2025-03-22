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
    getContext: () => currentContext,
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
 * @property {(data: ShowOverlayData, currentIndex: number) => void} showOverlay
 * @property {() => void} hideOverlay
 * @property {(direction: 'prev' | 'next') => void} navigateErrors
 */

/**
 * @param {CreateOverlayMachineOptions} options
 */
const createOverlayMachine = (options) => {
  const { hideOverlay, showOverlay, navigateErrors } = options;

  return createMachine(
    {
      initial: "hidden",
      context: {
        level: "error",
        messages: [],
        messageSource: "build",
        currentErrorIndex: 0,
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
            NAVIGATE: {
              target: "displayBuildError",
              actions: ["navigateErrors"],
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
            NAVIGATE: {
              target: "displayRuntimeError",
              actions: ["navigateErrors"],
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
            currentErrorIndex: 0,
          };
        },
        appendMessages: (context, event) => {
          return {
            messages: context.messages.concat(event.messages),
            level: event.level || context.level,
            messageSource: event.type === "RUNTIME_ERROR" ? "runtime" : "build",
            currentErrorIndex: context.currentErrorIndex,
          };
        },
        setMessages: (context, event) => {
          return {
            messages: event.messages,
            level: event.level || context.level,
            messageSource: event.type === "RUNTIME_ERROR" ? "runtime" : "build",
            currentErrorIndex: 0,
          };
        },
        navigateErrors: (context, event) => {
          const totalErrors = context.messages.length;
          let newIndex = context.currentErrorIndex;

          if (event.direction === "next") {
            newIndex = (newIndex + 1) % totalErrors;
          } else if (event.direction === "prev") {
            newIndex = (newIndex - 1 + totalErrors) % totalErrors;
          }

          navigateErrors(event.direction);

          return {
            currentErrorIndex: newIndex,
          };
        },
        hideOverlay,
        showOverlay: (context) => {
          showOverlay(context, context.currentErrorIndex);
          return context;
        },
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

// Updated styles to match the new design
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
  overflow: "auto",
  backgroundColor: "#1a1117",
  color: "white",
  fontFamily: "sans-serif",
  display: "flex",
  flexDirection: "column",
};

const headerStyle = {
  backgroundColor: "#8b1538",
  color: "white",
  padding: "10px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
};

const logoContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
};

const titleStyle = {
  fontSize: "24px",
  fontWeight: "normal",
  margin: 0,
};

const navigationStyle = {
  display: "flex",
  alignItems: "center",
  padding: "10px 20px",
  justifyContent: "flex-end",
  gap: "10px",
  backgroundColor: "transparent",
};

const navButtonStyle = {
  backgroundColor: "#3a3340",
  color: "white",
  border: "none",
  padding: "6px 12px",
  cursor: "pointer",
  borderRadius: "2px",
  fontFamily: "sans-serif",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  gap: "5px",
};

const dismissButtonStyle = {
  color: "#ffffff",
  padding: "6px 12px",
  cursor: "pointer",
  backgroundColor: "transparent",
  border: "none",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
};

const keyboardShortcutStyle = {
  backgroundColor: "#555",
  color: "white",
  padding: "2px 5px",
  borderRadius: "2px",
  marginLeft: "5px",
  fontSize: "12px",
};

const errorContentStyle = {
  padding: "20px",
  flex: 1,
};

const errorTypeStyle = {
  color: "#e83b46",
  fontSize: "1.2em",
  marginBottom: "20px",
  fontFamily: "sans-serif",
};

const errorMessageStyle = {
  lineHeight: "1.5",
  fontSize: "1rem",
  fontFamily: "Menlo, Consolas, monospace",
  whiteSpace: "pre-wrap",
};

const footerStyle = {
  padding: "15px 20px",
  color: "#aaa",
  fontSize: "12px",
  borderTop: "1px solid #333",
};

const logoStyle = {
  width: "40px",
  height: "40px",
  marginRight: "10px",
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
  let errorContentElement;
  /** @type {HTMLDivElement | null | undefined} */
  let navigationElement;
  /** @type {HTMLDivElement | null | undefined} */
  let currentErrorCountElement;
  /** @type {HTMLHeadingElement | null | undefined} */
  let titleElement;
  /** @type {Array<(element: HTMLDivElement) => void>} */
  let onLoadQueue = [];
  /** @type {TrustedTypePolicy | undefined} */
  let overlayTrustedTypesPolicy;
  /** @type {Array<{ message: any, type: string }>} */
  let currentMessages = [];
  /** @type {number} */
  let currentErrorIndex = 0;

  /**
   * @param {HTMLElement} element
   * @param {CSSStyleDeclaration} style
   */
  function applyStyle(element, style) {
    Object.keys(style).forEach((prop) => {
      element.style[prop] = style[prop];
    });
  }

  /**
   * Creates and returns an SVG element for the logo
   * @returns {HTMLElement}
   */
  function createLogo() {
    const logoSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
      <path fill="#fff" d="M300 0l265 150v300L300 600 35 450V150z"/>
      <path fill="#8ed6fb" d="M517.7 439.5L308.8 557.8v-92L439 394.1l78.7 45.4zm14.3-12.9V179.4l-76.4 44.1v159l76.4 44.1zM81.5 439.5l208.9 118.2v-92l-130.2-71.6-78.7 45.4zm-14.3-12.9V179.4l76.4 44.1v159l-76.4 44.1zm8.9-263.2L290.4 42.2v89l-137.3 75.5-1.1.6-75.9-43.9zm446.9 0L308.8 42.2v89L446 206.8l1.1.6 75.9-44z"/>
      <path fill="#1c78c0" d="M290.4 444.8L162 374.1V234.2l128.4 74.1v136.5zm18.4 0l128.4-70.6v-140l-128.4 74.1v136.5zM299.6 303zm-129-85l129-70.9L428.5 218l-128.9 74.4-129-74.4z"/>
    </svg>`;

    const logoContainer = document.createElement("div");
    logoContainer.innerHTML = overlayTrustedTypesPolicy
      ? overlayTrustedTypesPolicy.createHTML(logoSvg)
      : logoSvg;
    applyStyle(logoContainer, logoStyle);
    return logoContainer;
  }

  const overlayService = createOverlayMachine({
    showOverlay: (context, errorIndex) => {
      show(context, errorIndex, options.trustedTypesPolicyName);
    },
    hideOverlay: hide,
    navigateErrors,
  });

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
      const doc = /** @type {Document} */ (
        /** @type {HTMLIFrameElement} */ (iframeContainerElement)
          .contentDocument
      );

      containerElement = doc.createElement("div");
      applyStyle(containerElement, containerStyle);

      // Create header
      const headerElement = doc.createElement("div");
      applyStyle(headerElement, headerStyle);

      // Logo and title
      const logoContainer = doc.createElement("div");
      applyStyle(logoContainer, logoContainerStyle);

      const logo = createLogo();
      logoContainer.appendChild(logo);

      titleElement = doc.createElement("h1");
      titleElement.textContent = "Compiled with problems:";
      applyStyle(titleElement, titleStyle);
      logoContainer.appendChild(titleElement);

      headerElement.appendChild(logoContainer);

      // Dismiss button
      const dismissContainer = doc.createElement("div");
      const dismissButton = doc.createElement("button");
      dismissButton.textContent = "DISMISS";
      applyStyle(dismissButton, dismissButtonStyle);
      dismissButton.addEventListener("click", () => {
        overlayService.send({ type: "DISMISS" });
      });

      const escKeyElement = doc.createElement("span");
      escKeyElement.textContent = "ESC";
      applyStyle(escKeyElement, keyboardShortcutStyle);
      dismissButton.appendChild(escKeyElement);

      dismissContainer.appendChild(dismissButton);
      headerElement.appendChild(dismissContainer);

      containerElement.appendChild(headerElement);

      // Navigation bar
      navigationElement = doc.createElement("div");
      applyStyle(navigationElement, navigationStyle);

      currentErrorCountElement = doc.createElement("div");
      currentErrorCountElement.textContent = "ERROR 0/0";
      navigationElement.appendChild(currentErrorCountElement);

      const navButtonGroup = doc.createElement("div");
      applyStyle(navButtonGroup, navigationStyle);
      const prevButton = doc.createElement("button");
      prevButton.innerHTML = `<span>⌘ + ←</span> PREV`;
      applyStyle(prevButton, navButtonStyle);
      prevButton.addEventListener("click", () => {
        overlayService.send({ type: "NAVIGATE", direction: "prev" });
      });

      const nextButton = doc.createElement("button");
      nextButton.innerHTML = `NEXT <span>⌘ + →</span>`;
      applyStyle(nextButton, navButtonStyle);
      nextButton.addEventListener("click", () => {
        overlayService.send({ type: "NAVIGATE", direction: "next" });
      });

      navButtonGroup.appendChild(prevButton);
      navButtonGroup.appendChild(nextButton);
      navigationElement.appendChild(navButtonGroup);

      containerElement.appendChild(navigationElement);

      // Error content area
      errorContentElement = doc.createElement("div");
      applyStyle(errorContentElement, errorContentStyle);
      containerElement.appendChild(errorContentElement);

      // Footer
      const footerElement = doc.createElement("div");
      footerElement.textContent =
        "This screen is only visible in development only. It will not appear in production. Open your browser console to further inspect this error.";
      applyStyle(footerElement, footerStyle);
      containerElement.appendChild(footerElement);

      doc.body.appendChild(containerElement);

      // Add keyboard listeners
      doc.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          overlayService.send({ type: "DISMISS" });
        } else if (e.key === "ArrowLeft" && (e.metaKey || e.ctrlKey)) {
          overlayService.send({ type: "NAVIGATE", direction: "prev" });
        } else if (e.key === "ArrowRight" && (e.metaKey || e.ctrlKey)) {
          overlayService.send({ type: "NAVIGATE", direction: "next" });
        }
      });

      onLoadQueue.forEach((onLoad) => {
        onLoad(containerElement);
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

  /**
   * Navigates between errors
   * @param {string} direction 'prev' or 'next'
   */
  function navigateErrors(direction) {
    if (!currentMessages.length) return;

    if (direction === "next") {
      currentErrorIndex = (currentErrorIndex + 1) % currentMessages.length;
    } else {
      currentErrorIndex =
        (currentErrorIndex - 1 + currentMessages.length) %
        currentMessages.length;
    }

    displayCurrentError();
  }

  /**
   * Displays the current error based on the currentErrorIndex
   */
  function displayCurrentError() {
    if (!errorContentElement || !currentMessages.length) return;

    const message = currentMessages[currentErrorIndex];
    const { header, body } = formatProblem(message.type, message.message);

    // Update the error counter
    if (currentErrorCountElement) {
      currentErrorCountElement.textContent = `ERROR ${currentErrorIndex + 1}/${currentMessages.length}`;
    }

    // Clear previous content
    errorContentElement.innerHTML = overlayTrustedTypesPolicy
      ? overlayTrustedTypesPolicy.createHTML("")
      : "";

    // Create type element
    const typeElement = document.createElement("div");
    typeElement.innerText = header;
    applyStyle(typeElement, errorTypeStyle);

    if (
      typeof message.message === "object" &&
      message.message.moduleIdentifier
    ) {
      applyStyle(typeElement, { cursor: "pointer" });
      typeElement.setAttribute("data-can-open", true);
      typeElement.addEventListener("click", () => {
        fetch(
          `/webpack-dev-server/open-editor?fileName=${message.message.moduleIdentifier}`,
        );
      });
    }

    // Create message element
    const messageTextNode = document.createElement("div");
    const text = ansiHTML(encode(body));
    messageTextNode.innerHTML = overlayTrustedTypesPolicy
      ? overlayTrustedTypesPolicy.createHTML(text)
      : text;
    applyStyle(messageTextNode, errorMessageStyle);

    errorContentElement.appendChild(typeElement);
    errorContentElement.appendChild(messageTextNode);
  }

  // Hide overlay
  function hide() {
    if (!iframeContainerElement) {
      return;
    }

    document.body.removeChild(iframeContainerElement);

    iframeContainerElement = null;
    containerElement = null;
    errorContentElement = null;
    navigationElement = null;
    currentErrorCountElement = null;
    titleElement = null;
    currentMessages = [];
    currentErrorIndex = 0;
  }

  /**
   * Show overlay with errors
   * @param {ShowOverlayData} data
   * @param {number} errorIndex
   * @param {string | null} trustedTypesPolicyName
   */
  function show(data, errorIndex, trustedTypesPolicyName) {
    const { level = "error", messages, messageSource } = data;

    ensureOverlayExists(() => {
      // Update the title based on message source
      if (titleElement) {
        titleElement.textContent =
          messageSource === "runtime"
            ? "Runtime Error"
            : "Compiled with problems:";

        if (containerElement && containerElement.firstChild) {
          containerElement.style.backgroundColor =
            messageSource === "runtime" ? "#1a1117" : "#18181B";
          containerElement.firstChild.style.backgroundColor =
            messageSource === "runtime" ? "#8b1538" : "#18181B";
        }
      }

      // Store messages for navigation
      currentMessages = messages.map((message) => {
        return {
          type: level,
          message,
        };
      });

      currentErrorIndex = Math.min(errorIndex, currentMessages.length - 1);

      // Display the current error
      displayCurrentError();
    }, trustedTypesPolicyName);
  }

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
      // if error stack indicates a React error boundary caught the error, do not show overlay.
      if (
        error &&
        error.stack &&
        error.stack.includes("invokeGuardedCallbackDev")
      ) {
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

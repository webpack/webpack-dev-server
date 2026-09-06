import configureOverlay from "webpack-dev-middleware/client/overlay";

/** @typedef {import("./index.js").EXPECTED_ANY} EXPECTED_ANY */

/**
 * @typedef {object} Context
 * @property {"warning" | "error"} level level
 * @property {(string | Message)[]} messages messages
 * @property {"build" | "runtime"} messageSource message source
 */

/** @typedef {{ type: string } & Record<string, EXPECTED_ANY>} Event */

/**
 * @typedef {object} Options
 * @property {{ [state: string]: { on: Record<string, { target: string, actions?: string[] }> } }} states states
 * @property {Context} context context
 * @property {string} initial initial
 */

/**
 * @typedef {object} Implementation
 * @property {{ [actionName: string]: (ctx: Context, event: Event) => Context | void }} actions actions
 */

/**
 * @typedef {{ send: (event: Event) => void }} StateMachine
 */

/**
 * A simplified `createMachine` from `@xstate/fsm` with the following differences:
 * - the returned machine is technically a "service". No `interpret(machine).start()` is needed.
 * - the state definition only support `on` and target must be declared with { target: 'nextState', actions: [] } explicitly.
 * - event passed to `send` must be an object with `type` property.
 * - actions implementation will be [assign action](https://xstate.js.org/docs/guides/context.html#assign-action) if you return any value.
 * Do not return anything if you just want to invoke side effect.
 *
 * The goal of this custom function is to avoid installing the entire `'xstate/fsm'` package, while enabling modeling using
 * state machine. You can copy the first parameter into the editor at https://stately.ai/viz to visualize the state machine.
 * @param {Options} options options
 * @param {Implementation} implementation implementation
 * @returns {StateMachine} state machine
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
 * @typedef {object} ShowOverlayData
 * @property {"warning" | "error"} level level
 * @property {(string | Message)[]} messages messages
 * @property {"build" | "runtime"} messageSource message source
 */

/**
 * @typedef {object} CreateOverlayMachineOptions
 * @property {(data: ShowOverlayData) => void} showOverlay show overlay
 * @property {() => void} hideOverlay hide overlay
 */

/**
 * @param {CreateOverlayMachineOptions} options options
 * @returns {StateMachine} state machine
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
 * @param {Error} error error
 * @returns {undefined | string[]} stack
 */
const parseErrorToStacks = (error) => {
  if (!error || !(error instanceof Error)) {
    throw new Error("parseErrorToStacks expects Error object");
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
 * @param {ErrorCallback} callback callback
 * @returns {() => void} cleanup
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
 * @param {UnhandledRejectionCallback} callback callback
 * @returns {() => void} cleanup
 */
const listenToUnhandledRejection = (callback) => {
  window.addEventListener("unhandledrejection", callback);

  return function cleanup() {
    window.removeEventListener("unhandledrejection", callback);
  };
};

/** @typedef {Error & { file?: string, moduleName?: string, moduleIdentifier?: string, loc?: string, message?: string, stack?: string | string[] }} Message */

/**
 * @param {string} type type
 * @param {string | Message} item item
 * @returns {{ header: string, body: string }} formatted problem
 */
const formatProblem = (type, item) => {
  let header = type === "warning" ? "WARNING" : "ERROR";
  let body = "";

  if (typeof item === "string") {
    body += item;
  } else {
    const file = item.file || "";
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

  if (typeof item !== "string" && Array.isArray(item.stack)) {
    item.stack.forEach((stack) => {
      if (typeof stack === "string") {
        body += `\r\n${stack}`;
      }
    });
  }

  return { header, body };
};

/**
 * @typedef {object} CreateOverlayOptions
 * @property {(false | string)=} trustedTypesPolicyName trusted types policy name
 * @property {(boolean | ((error: Error) => void))=} catchRuntimeError runtime error catcher
 */

/**
 * @param {CreateOverlayOptions} options options
 * @returns {StateMachine} overlay
 */
const createOverlay = (options) => {
  const sharedOverlay = configureOverlay({
    trustedTypesPolicyName:
      options.trustedTypesPolicyName || "webpack-dev-server#overlay",
    openEditorEndpoint: "/webpack-dev-server/open-editor",
    paginate: false,
  });

  /** @type {(event: KeyboardEvent) => void} */
  let handleEscapeKey;

  /**
   * @returns {void}
   */

  const hideOverlayWithEscCleanup = () => {
    window.removeEventListener("keydown", handleEscapeKey);
    sharedOverlay.clear("webpack-dev-server");
  };

  const overlayService = createOverlayMachine({
    showOverlay: ({ level = "error", messages }) => {
      sharedOverlay.showProblems(
        level === "warning" ? "warnings" : "errors",
        messages.map((message) => {
          const { header, body } = formatProblem(level, message);
          const location = header.replace(/^(ERROR|WARNING)( in )?/, "");
          return location ? `${location}\n${body}` : body;
        }),
        "webpack-dev-server",
      );

      // The shared renderer links display paths. Resolve those links to the
      // compiler's module identifiers, which can be outside the server cwd.
      const frame = /** @type {HTMLIFrameElement | null} */ (
        document.getElementById("webpack-dev-middleware-hot-overlay")
      );
      const links =
        frame?.contentDocument?.querySelectorAll("[data-open-file]");
      links?.forEach((link) => {
        const file = link.getAttribute("data-open-file") || "";
        messages.forEach((message) => {
          if (typeof message === "string" || !message.moduleIdentifier) {
            return;
          }
          const name = (message.moduleName || message.file || "").replace(
            /^(\s|\S)*!/,
            "",
          );
          if (name && file.indexOf(`${name}:`) === 0) {
            link.setAttribute(
              "data-open-file",
              `${message.moduleIdentifier.replace(/^[^|]*\|/, "").replace(/^(\s|\S)*!/, "")}${file.slice(name.length)}`,
            );
          }
        });
      });
    },
    hideOverlay: hideOverlayWithEscCleanup,
  });
  /**
   * ESC key press to dismiss the overlay.
   * @param {KeyboardEvent} event Keydown event
   */
  handleEscapeKey = (event) => {
    if (event.key === "Escape" || event.key === "Esc" || event.keyCode === 27) {
      overlayService.send({ type: "DISMISS" });
    }
  };

  window.addEventListener("keydown", handleEscapeKey);

  if (options.catchRuntimeError) {
    /**
     * @param {Error | undefined} error error
     * @param {string} fallbackMessage fallback message
     */
    const handleError = (error, fallbackMessage) => {
      const errorObject =
        error instanceof Error
          ? error
          : new Error(error || fallbackMessage, { cause: error });

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

export { createOverlay, formatProblem };

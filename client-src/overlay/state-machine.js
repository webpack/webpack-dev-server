import createMachine from "./fsm.js";

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
  const overlayMachine = createMachine(
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
    }
  );

  return overlayMachine;
};

export default createOverlayMachine;

import createMachine from "./fsm.js";

/**
 * @typedef {Object} ShowOverlayData
 * @property {'warning' | 'error'} level
 * @property {Array<string  | { moduleIdentifier?: string, moduleName?: string, loc?: string, message?: string }>} messages
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
          };
        },
        appendMessages: (context, event) => {
          return {
            messages: context.messages.concat(event.messages),
            level: event.level || context.level,
          };
        },
        setMessages: (context, event) => {
          return {
            messages: event.messages,
            level: event.level || context.level,
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

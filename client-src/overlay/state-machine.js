import { createMachine, assign } from "@xstate/fsm";

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
      id: "overlay",
      initial: "hidden",
      context: {
        level: "error",
        messages: [],
      },
      states: {
        hidden: {
          entry: "hideOverlay",
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
            DISMISS: { target: "hidden", actions: "dismissMessages" },
            BUILD_ERROR: {
              target: "displayBuildError",
              actions: ["appendMessages", "showOverlay"],
            },
          },
        },
        displayRuntimeError: {
          on: {
            DISMISS: { target: "hidden", actions: "dismissMessages" },
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
        dismissMessages: assign({
          messages: [],
          level: "error",
        }),
        appendMessages: assign({
          messages: (context, event) => context.messages.concat(event.messages),
          level: (context, event) => event.level || context.level,
        }),
        setMessages: assign({
          messages: (_, event) => event.messages,
          level: (context, event) => event.level || context.level,
        }),
        hideOverlay,
        showOverlay,
      },
    }
  );

  return overlayMachine;
};

export default createOverlayMachine;

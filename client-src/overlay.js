import configureOverlay from "webpack-dev-middleware/client/overlay";

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

/** @typedef {{ type: "DISMISS" } | { type: "BUILD_ERROR", level: "warning" | "error", messages: (string | Message)[] }} OverlayEvent */

/**
 * @typedef {object} CreateOverlayOptions
 * @property {(false | string)=} trustedTypesPolicyName trusted types policy name
 * @property {(boolean | ((error: Error) => boolean))=} catchRuntimeError runtime error catcher
 */

/**
 * @param {CreateOverlayOptions} options options
 * @returns {{ send: (event: OverlayEvent) => void }} overlay
 */
const createOverlay = (options) => {
  const sharedOverlay = configureOverlay({
    trustedTypesPolicyName:
      options.trustedTypesPolicyName || "webpack-dev-server#overlay",
    openEditorEndpoint: "/webpack-dev-server/open-editor",
    paginate: true,
    catchRuntimeError: options.catchRuntimeError || (() => false),
  });

  /** @type {Document | null | undefined} */
  let overlayDocument;
  /** @type {(string | Message)[]} */
  let overlayMessages = [];

  // Pagination renders new links. Resolve them after mouse or keyboard
  // navigation as well as when compiler messages first arrive.
  const updateEditorLinks = () => {
    const links = overlayDocument?.querySelectorAll("[data-open-file]");
    links?.forEach((link) => {
      const file = link.getAttribute("data-open-file") || "";
      overlayMessages.forEach((message) => {
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
  };

  return {
    send(event) {
      if (event.type === "DISMISS") {
        sharedOverlay.clear("webpack-dev-server:warning");
        sharedOverlay.clear("webpack-dev-server:error");
        sharedOverlay.clear("runtime");
        overlayMessages = [];
        return;
      }

      const { level, messages } = event;
      sharedOverlay.showProblems(
        level === "warning" ? "warnings" : "errors",
        messages.map((message) => {
          const { header, body } = formatProblem(level, message);
          const location = header.replace(/^(ERROR|WARNING)( in )?/, "");
          return location ? `${location}\n${body}` : body;
        }),
        `webpack-dev-server:${level}`,
      );

      overlayMessages = messages;
      const frame = /** @type {HTMLIFrameElement | null} */ (
        document.getElementById("webpack-dev-middleware-hot-overlay")
      );
      if (frame?.contentDocument !== overlayDocument) {
        overlayDocument = frame?.contentDocument;
        overlayDocument?.addEventListener("click", updateEditorLinks);
        overlayDocument?.addEventListener("keydown", updateEditorLinks);
      }
      updateEditorLinks();
    },
  };
};

export { createOverlay, formatProblem };

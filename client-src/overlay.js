// The overlay itself lives in webpack-dev-middleware — this is the adapter
// that keeps this package's shape on top of it: `createOverlay` returning
// something with `send`, and `formatProblem` for the console.
//
// Two things the two sides do differently, and how they meet here:
//
//   * This package sends webpack's error objects over the wire and formats
//     them in the browser; dev-middleware's server formats them first and its
//     overlay takes strings, whose first line is the location. `problemLine`
//     produces that shape from an object, so a problem renders the same way it
//     does for the middleware.
//   * That overlay is a pair of calls, `showProblems` and `clear`, rather than
//     a state machine. The events this package sends map onto them directly,
//     and the mapping is the whole of `send` below.
import configureOverlay, {
  clear,
  showProblems,
} from "webpack-dev-middleware/client/overlay";

/** @typedef {import("./index.js").EXPECTED_ANY} EXPECTED_ANY */
/** @typedef {{ file?: string, moduleName?: string, loc?: string, message?: string, stack?: EXPECTED_ANY }} Message */

// What this package's overlay element has always been called. Kept through
// dev-middleware's `id` option so anything that queries it — a test, a
// screenshot tool, an integration that hides it — is unaffected by where the
// overlay now comes from.
const OVERLAY_ID = "webpack-dev-server-client-overlay";

// Build problems live under one source so a clean build can drop them without
// touching runtime errors, which the overlay keeps in a slot of its own.
const BUILD_SOURCE = "";

// The Trusted Types policy this package's overlay has always created. It has to
// stay this name: under an enforced `require-trusted-types-for 'script'` the
// page's CSP allowlists a policy by name, and dev-middleware's own default is a
// different one.
const TRUSTED_TYPES_POLICY_NAME = "webpack-dev-server#overlay";

// The route this package serves for opening a file in an editor, which makes
// the file references in a problem clickable. Off by default in
// dev-middleware, since it has no route of its own to point at.
const OPEN_EDITOR_ENDPOINT = "/webpack-dev-server/open-editor";

/**
 * Where a problem happened, in the one-line form dev-middleware's overlay
 * renders as the heading. Empty when webpack did not say.
 * @param {string | Message} item item
 * @returns {string} location
 */
const problemLocation = (item) => {
  if (typeof item === "string") {
    return "";
  }

  const file = item.file || "";
  // `indexOf`, not `includes`: this file is compiled to an ES5 baseline.
  const moduleName = item.moduleName
    ? item.moduleName.indexOf("!") !== -1
      ? `${item.moduleName.replace(/^(\s|\S)*!/, "")} (${item.moduleName})`
      : `${item.moduleName}`
    : "";
  const loc = item.loc;

  if (!moduleName && !file) {
    return "";
  }

  return `${moduleName ? `${moduleName}${file ? ` (${file})` : ""}` : file}${
    loc ? ` ${loc}` : ""
  }`;
};

/**
 * What a problem says, with any stack webpack attached.
 * @param {string | Message} item item
 * @returns {string} body
 */
const problemBody = (item) => {
  let body = typeof item === "string" ? item : item.message || "";

  if (typeof item !== "string" && Array.isArray(item.stack)) {
    // `forEach`, not `for...of`: an ES5 target has no array iterator.
    item.stack.forEach((frame) => {
      if (typeof frame === "string") {
        body += `\r\n${frame}`;
      }
    });
  }

  return body;
};

/**
 * @param {string} type type
 * @param {string | Message} item item
 * @returns {{ header: string, body: string }} formatted problem
 */
const formatProblem = (type, item) => {
  const location = problemLocation(item);

  return {
    header: `${type === "warning" ? "WARNING" : "ERROR"}${location ? ` in ${location}` : ""}`,
    body: problemBody(item),
  };
};

/**
 * One problem as dev-middleware's overlay wants it: location first, then what
 * it says. It renders the first line as the heading and prefixes the level
 * itself, which is why the level is not repeated here.
 * @param {string | Message} item item
 * @returns {string} the problem as one string
 */
const problemLine = (item) => {
  const location = problemLocation(item);
  const body = problemBody(item);

  return location ? `${location}\n${body}` : body;
};

/**
 * @typedef {object} CreateOverlayOptions
 * @property {(false | string)=} trustedTypesPolicyName trusted types policy name
 * @property {(boolean | ((error: Error) => boolean))=} catchRuntimeError whether, or which, runtime errors to show — the previous `=> void` was wrong, the returned value has always decided
 */

/**
 * @param {CreateOverlayOptions} options options
 * @returns {{ send: (event: EXPECTED_ANY) => void }} overlay
 */
const createOverlay = (options) => {
  configureOverlay({
    id: OVERLAY_ID,
    catchRuntimeError: options.catchRuntimeError,
    openEditorEndpoint: OPEN_EDITOR_ENDPOINT,
    // `false` means "no name of my own", which is this package's default name
    // rather than dev-middleware's.
    trustedTypesPolicyName:
      typeof options.trustedTypesPolicyName === "string"
        ? options.trustedTypesPolicyName
        : TRUSTED_TYPES_POLICY_NAME,
  });

  return {
    /**
     * @param {EXPECTED_ANY} event event
     */
    send(event) {
      switch (event.type) {
        case "BUILD_ERROR":
          showProblems(
            event.level === "warning" ? "warnings" : "errors",
            /** @type {(string | Message)[]} */ (event.messages).map(
              (message) => problemLine(message),
            ),
            BUILD_SOURCE,
          );
          break;
        // A build that succeeded says nothing about an error the page threw on
        // its own, so only this package's build problems go.
        case "BUILD_OK":
          clear(BUILD_SOURCE);
          break;
        // Everything, runtime errors included: sent when a rebuild starts, or
        // when the connection is gone, and neither leaves anything worth
        // keeping on screen.
        case "DISMISS":
          clear();
          break;
        default:
          break;
      }
    },
  };
};

export { createOverlay, formatProblem };

// styles are inspired by `react-error-overlay`

// The class names are quite generic, but it should be fine since they are
// scoped to the iframe only.

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
  className: "webpack-container",
  css: /* css */ `.webpack-container {
      position: fixed;
      box-sizing: border-box;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      font-size: large;
      padding: 2rem 2rem 4rem 2rem;
      line-height: 1.2;
      white-space: pre-wrap;
      overflow: auto;
      background-color: rgba(0, 0, 0, 0.9);
      color: white;
    }
  `,
};

const headerStyle = {
  className: "webpack-header",
  css: /* css */ `.webpack-header {
      color: #e83b46;
      font-size: 2em;
      font-family: sans-serif;
      white-space: pre-wrap;
      margin: 0 2rem 2rem 0;
      flex: 0 0 auto;
      max-height: 50%;
      overflow: auto;
    }
  `,
};

const dismissButtonStyle = {
  className: "webpack-dismiss-btn",
  css: /* css */ `.webpack-dismiss-btn {
    color: #ffffff;
    line-height: 1rem;
    font-size: 1.5rem;
    padding: 1rem;
    cursor: pointer;
    position: absolute;
    right: 0;
    top: 0;
    background-color: transparent;
    border: none;
  }
  
  .webpack-dismiss-btn:hover {
    color: #d1d5db;
  }`,
};

const msgTypeStyle = {
  className: "webpack-msg-type",
  css: /* css */ `.webpack-msg-type {
      margin-bottom: 1rem;
      color: #e83b46;
      font-size: 1.2em;
      font-family: sans-serif;
    }

  .webpack-msg-type[data-can-open] {
    cursor: pointer;
  }
  `,
};

const msgTextStyle = {
  className: "webpack-msg-text",
  css: /* css */ `.webpack-msg-text {
      line-height: 1.5;
      font-size: 1rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    }
  `,
};

const msgStyles = {
  error: {
    className: "webpack-error-msg",
    css: /* css */ `.webpack-error-msg {
      background-color: rgba(206, 17, 38, 0.1);
      color: #fccfcf;
      padding: 1rem 1rem 1.5rem 1rem;
    }`,
  },
  warning: {
    className: "webpack-warning-msg",
    css: /* css */ `.webpack-warning-msg {
      background-color: rgba(251, 245, 180, 0.1);
      color: #fbf5b4;
      padding: 1rem 1rem 1.5rem 1rem;
    }`,
  },
};

/**
 * @typedef {Object} CssLoader
 * @property {(css: string) => void} load
 */

/**
 *
 * @param {Document} doc
 * @return {CssLoader}
 */
const createCssLoader = (doc) => {
  /** @type {string[]} */
  const loadedCss = [];

  return {
    load: (css) => {
      // ignore CSS rule that has loaded before
      if (!loadedCss.includes(css)) {
        const style = doc.createElement("style");
        style.innerHTML = css;
        doc.head.appendChild(style);
        loadedCss.push(css);
      }
    },
  };
};

export {
  msgStyles,
  iframeStyle,
  containerStyle,
  headerStyle,
  dismissButtonStyle,
  msgTypeStyle,
  msgTextStyle,
  createCssLoader,
};

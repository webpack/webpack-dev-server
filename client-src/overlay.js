'use strict';

// The error overlay is inspired (and mostly copied) from Create React App (https://github.com/facebookincubator/create-react-app)
// They, in turn, got inspired by webpack-hot-middleware (https://github.com/glenjamin/webpack-hot-middleware).

const ansiHTML = require('ansi-html');
const { encode } = require('html-entities');

const colors = {
  reset: ['transparent', 'transparent'],
  black: '181818',
  red: 'E36049',
  green: 'B3CB74',
  yellow: 'FFD080',
  blue: '7CAFC2',
  magenta: '7FACCA',
  cyan: 'C3C2EF',
  lightgrey: 'EBE7E3',
  darkgrey: '6D7891',
};

let overlayIframe = null;
let overlayDiv = null;
let lastOnOverlayDivReady = null;

ansiHTML.setColors(colors);

function createOverlayIframe(onIframeLoad) {
  const iframe = document.createElement('iframe');

  iframe.id = 'webpack-dev-server-client-overlay';
  iframe.src = 'about:blank';
  iframe.style.position = 'fixed';
  iframe.style.left = 0;
  iframe.style.top = 0;
  iframe.style.right = 0;
  iframe.style.bottom = 0;
  iframe.style.width = '100vw';
  iframe.style.height = '100vh';
  iframe.style.border = 'none';
  iframe.style.zIndex = 9999999999;
  iframe.onload = onIframeLoad;

  return iframe;
}

function addOverlayDivTo(iframe) {
  const div = iframe.contentDocument.createElement('div');

  div.id = 'webpack-dev-server-client-overlay-div';
  div.style.position = 'fixed';
  div.style.boxSizing = 'border-box';
  div.style.left = 0;
  div.style.top = 0;
  div.style.right = 0;
  div.style.bottom = 0;
  div.style.width = '100vw';
  div.style.height = '100vh';
  div.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
  div.style.color = '#E8E8E8';
  div.style.fontFamily = 'Menlo, Consolas, monospace';
  div.style.fontSize = 'large';
  div.style.padding = '2rem';
  div.style.lineHeight = '1.2';
  div.style.whiteSpace = 'pre-wrap';
  div.style.overflow = 'auto';

  iframe.contentDocument.body.appendChild(div);

  return div;
}

function ensureOverlayDivExists(onOverlayDivReady) {
  if (overlayDiv) {
    // Everything is ready, call the callback right away.
    onOverlayDivReady(overlayDiv);

    return;
  }

  // Creating an iframe may be asynchronous so we'll schedule the callback.
  // In case of multiple calls, last callback wins.
  lastOnOverlayDivReady = onOverlayDivReady;

  if (overlayIframe) {
    // We've already created it.
    return;
  }

  // Create iframe and, when it is ready, a div inside it.
  overlayIframe = createOverlayIframe(() => {
    overlayDiv = addOverlayDivTo(overlayIframe);
    // Now we can talk!
    lastOnOverlayDivReady(overlayDiv);
  });

  // Zalgo alert: onIframeLoad() will be called either synchronously
  // or asynchronously depending on the browser.
  // We delay adding it so `overlayIframe` is set when `onIframeLoad` fires.
  document.body.appendChild(overlayIframe);
}

// Successful compilation.
function clear() {
  if (!overlayDiv) {
    // It is not there in the first place.
    return;
  }

  // Clean up and reset internal state.
  document.body.removeChild(overlayIframe);

  overlayDiv = null;
  overlayIframe = null;
  lastOnOverlayDivReady = null;
}

// Compilation with errors (e.g. syntax error or missing modules).
function showMessage(messages) {
  ensureOverlayDivExists((div) => {
    const headerElement = document.createElement('span');

    headerElement.innerText = 'Failed to compile.';
    headerElement.style.color = `#${colors.red}`;

    const closeButtonElement = document.createElement('button');

    closeButtonElement.innerText = 'X';
    closeButtonElement.style.background = 'transparent';
    closeButtonElement.style.border = 'none';
    closeButtonElement.style.fontSize = '20px';
    closeButtonElement.style.fontWeight = 'bold';
    closeButtonElement.style.color = 'white';
    closeButtonElement.style.cursor = 'pointer';
    closeButtonElement.style.cssFloat = 'right';
    closeButtonElement.style.styleFloat = 'right';
    closeButtonElement.addEventListener('click', () => {
      clear();
    });

    const breakElementFirst = document.createElement('br');
    const breakElementSecond = document.createElement('br');

    // Make it look similar to our terminal.
    const errorMessage = messages[0].message || messages[0];
    const text = ansiHTML(encode(errorMessage));
    const messageTextNode = document.createTextNode(text);

    div.appendChild(headerElement);
    div.appendChild(closeButtonElement);
    div.appendChild(breakElementFirst);
    div.appendChild(breakElementSecond);
    div.appendChild(messageTextNode);
  });
}

module.exports = {
  clear,
  showMessage,
};

'use strict';

/* global DEV_SERVER_OPTIONS */

const socket = require('./socket');
require('../css/live.css');

// this is piped in at runtime build via DefinePlugin in /lib/plugins.js
const devServerOptions = DEV_SERVER_OPTIONS; // eslint-disable-line no-unused-vars

let hot = false;
let currentHash = '';

function hide(element) {
  element.style.display = 'none';
}

function show(element) {
  element.style.display = '';
}

function get(selector) {
  return document.querySelector(selector);
}

function ready() {
  const body = get('body');
  const bodyTemplate = get('#body-template').innerText;

  body.innerHTML = bodyTemplate;

  const status = get('#status');
  const okness = get('#okness');
  const errors = get('#errors');
  const iframe = get('#iframe');
  const header = get('header');
  const contentPage = window.location.pathname.substr('/webpack-dev-server'.length) + window.location.search;

  status.innerText = 'Connecting to sockjs server...';
  hide(errors);
  hide(iframe);
  header.classList.add('active');

  iframe.addEventListener('load', function iframeLoad() {
    status.innerText = 'App ready.';
    header.classList.remove('active', 'warning', 'error');
    show(iframe);
  }, false);

  function reload() {
    const content = iframe.contentWindow;

    if (hot) {
      status.innerText = 'App hot update.';
      try {
        content.postMessage('webpackHotUpdate' + currentHash, '*');
      } catch (e) {
        console.warn(e); // eslint-disable-line no-console
      }
      show(iframe);
    } else {
      status.innerText = 'App updated. Reloading app...';
      header.classList.add('active');

      try {
        let old = content.location + '';
        if (old.indexOf('about') === 0) {
          old = null;
        }

        iframe.setAttribute('src', old || (contentPage + window.location.hash));

        if (old) {
          content.location.reload();
        }
      } catch (e) {
        iframe.setAttribute('src', contentPage + window.location.hash);
      }
    }
  }

  socket(devServerOptions, {
    hot: function msgHot() {
      hot = true;
      iframe.setAttribute('src', contentPage + window.location.hash);
    },
    invalid: function msgInvalid() {
      okness.innerText = '';
      status.innerText = 'App updated. Recompiling...';
      header.classList.add('active');

      hide(errors);

      if (!hot) {
        hide(iframe);
      }
    },
    hash: function msgHash(hash) {
      currentHash = hash;
    },
    'still-ok': function stillOk() {
      okness.innerText = '';
      status.innerText = 'App ready.';
      header.classList.remove('active', 'warning', 'error');

      hide(errors);

      if (!hot) {
        show(iframe);
      }
    },
    ok: function msgOk() {
      okness.innerText = '';
      header.classList.remove('active', 'warning', 'error');

      hide(errors);
      reload();
    },
    warnings: function msgWarnings() {
      okness.innerText = 'Warnings while compiling.';
      header.classList.add('warning');

      hide(errors);
      reload();
    },
    errors: function msgErrors(messages) {
      status.innerText = 'App updated with errors. No reload!';
      okness.innerText = 'Errors while compiling.';
      errors.innerText = '\n' + messages.join('\n\n\n') + '\n\n';
      header.classList.add('error');

      show(errors);
      hide(iframe);
    },
    close: function msgClose() {
      status.innerText = '';
      okness.innerText = 'Disconnected.';
      errors.innerText = '\n\n\n  Lost connection to webpack-dev-server.\n  Please restart the server to reestablish connection...\n\n\n\n';
      header.classList.add('error');

      show(errors);
      hide(iframe);
    }
  });
}

document.addEventListener('DOMContentLoaded', ready);

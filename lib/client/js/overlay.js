'use strict';

require('style-loader!css-loader!../css/overlay.css');

const ansiHTML = require('ansi-html');
const Entities = require('html-entities').AllHtmlEntities;
const template = require('raw-loader!../overlay.html');

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
  darkgrey: '6D7891'
};
const entities = new Entities();

let instance;

ansiHTML.setColors(colors);

function Overlay() {
  const container = document.createElement('div');

  container.innerHTML = template;

  const iframe = container.firstChild;
  const pre = iframe.querySelector('pre');

  document.body.appendChild(iframe);

  this.remove = function remove() {
    document.body.removeChild(iframe);
  };

  this.write = function write(message) {
    const encoded = entities.encode(message);
    pre.innerHTML = ansiHTML(encoded);
  };
}

module.exports = {
  clear: function clear() {
    if (instance) {
      instance.remove();
      instance = null;
    }
  },

  showMessage: function showMessage(messages) {
    if (!instance) {
      instance = new Overlay();
    }
    instance.write(messages[0]);
  }
};

'use strict';

const send = require('../../../client/send');

const target = document.querySelector('#target');

target.innerHTML = `Click anywhere on this page and then do some keystrokes`;

document.addEventListener('keypress', (event) =>
  send({
    type: 'keypress',
    data: String.fromCharCode(event.which),
  })
);

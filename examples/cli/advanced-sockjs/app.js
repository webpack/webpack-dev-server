'use strict';

const target = document.querySelector('#target');

target.innerHTML = `
  Open <a href="/devtools" target="_blank">devtools</a> in a new window
  <div id="keypressed"></div>
`;

if (process.env.NODE_ENV === 'development') {
  // Simple example to send uncaught error to webpack-dev-server for logging
  const send = require('../../../client/send'); // eslint-disable-line global-require
  window.addEventListener('error', (error) =>
    send({
      type: 'log',
      data: error.message,
    })
  );

  // Simple example of outputting of keystrokes from devtools on screen
  const listen = require('../../../client/listen'); // eslint-disable-line global-require
  listen((message) => {
    if (message.data.type === 'keypress') {
      document.querySelector('#keypressed').innerHTML += message.data.data;
    }
  });
}

throw new Error('Hello world');

'use strict';

/* global __resourceQuery WorkerGlobalScope self */

function listen(callback, eventName = 'custom') {
  const type = `webpack${eventName}`;

  function handle(message) {
    if (message.data == null || message.data.type !== type) return;
    callback(message.data);
  }

  self.addEventListener('message', handle);

  return function unsubscribe() {
    self.removeEventListener('message', handle);
  };
}

module.exports = listen;

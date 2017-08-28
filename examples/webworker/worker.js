/* eslint-env worker */


self.onmessage = function (e) {
  console.log('[WORKER]', e);
  self.postMessage({
    hello: 222,
  });
};

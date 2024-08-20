"use strict";

const myWorker = new Worker("./worker-bundle.js");

myWorker.onmessage = (event) => {
  console.log(`Worker said: ${event.data}`);
};

myWorker.postMessage("message");

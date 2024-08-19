"use strict";

const myWorker = new Worker("./worker.js");

myWorker.onmessage = (event) => {
  console.log(`Worker said: ${event.data}`);
};

myWorker.postMessage("message");

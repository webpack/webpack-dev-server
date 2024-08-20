"use strict";

postMessage("I'm working before postMessage");

onmessage = (event) => {
  postMessage(`Message sent: ${event.data}`);
};

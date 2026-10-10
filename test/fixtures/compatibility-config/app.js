import socket from "./react-refresh-socket.cjs";
import "./changing.cjs";

window.legacyMessages = window.legacyMessages || [];

// The plugin retries while the runtime has not connected yet.
const listen = (attempt) => {
  try {
    socket.init((message) => {
      window.legacyMessages.push(message);
    });
    window.socketReady = true;
  } catch (error) {
    if (attempt < 100) {
      setTimeout(() => listen(attempt + 1), 50);
    } else {
      window.socketError = error.message;
    }
  }
};

listen(0);

console.log("Hey.");

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}

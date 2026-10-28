import message from "./message.js";

function render() {
  document.querySelector("#message").textContent = message;
}
render();
if (module.hot) module.hot.accept("./message.js", render);

"use strict";

const target = document.querySelector("#target");

if (!window.fetch) {
  target.classList.add("fail");
  target.innerHTML = "fetch is not supported";
} else {
  fetch("/server.js")
    .then((res) => {
      if (res.status === 404) throw new Error("[server.js]: Not Found");
      return res;
    })
    .then((res) => res.text())
    .then((res) => {
      if (res.includes("console.log('webpack-dev-server/server');")) {
        target.classList.add("pass");
        target.innerHTML = "[client.js, server.js]: Success!";
      }
    })
    .catch((e) => {
      target.classList.add("fail");
      target.innerHTML = e.message;
    });
}

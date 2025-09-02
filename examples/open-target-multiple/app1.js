"use strict";

const target = document.querySelector("#target");

if (globalThis.location.href.endsWith("example1.html")) {
  target.classList.add("pass");
  target.innerHTML = "Success!";
} else {
  target.classList.add("fail");
  target.innerHTML = "Houston, we have a problem.";
}

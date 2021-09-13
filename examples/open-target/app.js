"use strict";

const target = document.querySelector("#target");

if (window.location.href.endsWith("example.html#page1")) {
  target.classList.add("pass");
  target.innerHTML = "Success!";
} else {
  target.classList.add("fail");
  target.innerHTML = "Houston, we have a problem.";
}

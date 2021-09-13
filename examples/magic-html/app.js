"use strict";

if (window.location.href.endsWith("main")) {
  document.querySelector("body").innerHTML =
    "<div>You are viewing the magic HTML route!</div>";
} else {
  const target = document.querySelector("#target");

  target.classList.add("pass");
  target.innerHTML = "Success!";
}

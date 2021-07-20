"use strict";

require("./style.less");

const target = document.querySelector("#target");

target.classList.add("pass");
target.innerHTML = "Success!";

const img = document.createElement("img");
img.src = "/svg.svg";
img.style = "width: 200px;";

document.body.appendChild(img);

// This results in a warning:
// if(!window) require("./" + window + "parseable.js");

// This results in an error:
// if(!window) require("test");

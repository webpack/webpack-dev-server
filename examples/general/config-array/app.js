"use strict";

require("./style.less");

const target = document.querySelector("#target");

target.classList.add("pass");
target.innerHTML = "Success!";

// This results in a warning:
// if(!window) require("./" + window + "parseable.js");

// This results in an error:
// if(!window) require("test");

"use strict";

const target = document.querySelector("#target");

target.classList.add("pass");
target.innerHTML = "Success!";

// This results in an error:
// if(!window) require("test");

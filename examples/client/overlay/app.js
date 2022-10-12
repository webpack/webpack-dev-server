"use strict";

const target = document.querySelector("#target");

// eslint-disable-next-line import/no-unresolved, import/extensions
const invalid = require("./invalid.js");

console.log(invalid);
target.classList.add("pass");
target.innerHTML = "Success!";

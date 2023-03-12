"use strict";

// eslint-disable-next-line import/order
const createErrorBtn = require("./error-button");

const target = document.querySelector("#target");

target.insertAdjacentElement("afterend", createErrorBtn());

// eslint-disable-next-line import/no-unresolved, import/extensions
const invalid = require("./invalid.js");

console.log(invalid);
target.classList.add("pass");
target.innerHTML = "Success!";

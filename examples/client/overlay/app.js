"use strict";

// eslint-disable-next-line import/order
const createErrorBtn = require("./error-button");

const target = document.querySelector("#target");

target.insertAdjacentElement(
  "afterend",
  createErrorBtn("Click to throw error", "Error message thrown from JS")
);

target.insertAdjacentElement(
  "afterend",
  createErrorBtn("Click to throw ignored error", "something something")
);

// eslint-disable-next-line import/no-unresolved, import/extensions
const invalid = require("./invalid.js");

console.log(invalid);
target.classList.add("pass");
target.innerHTML = "Success!";

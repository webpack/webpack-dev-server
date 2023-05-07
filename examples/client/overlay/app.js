"use strict";

// eslint-disable-next-line import/order
const createButton = require("./create-button");

/**
 * @param {string} errorMessage
 */
function unsafeOperation(errorMessage) {
  throw new Error(errorMessage);
}

const target = document.querySelector("#target");

target.insertAdjacentElement(
  "afterend",
  createButton("Click to throw ignored promise rejection", () => {
    const abortController = new AbortController();

    fetch("https://google.com", {
      signal: abortController.signal,
      mode: "no-cors",
    });

    setTimeout(() => abortController.abort(), 100);
  })
);

target.insertAdjacentElement(
  "afterend",
  createButton("Click to throw unhandled promise rejection", () => {
    setTimeout(() => Promise.reject(new Error("Async error")), 100);
  })
);

target.insertAdjacentElement(
  "afterend",
  createButton("Click to throw ignored error", () => {
    unsafeOperation("something something");
  })
);

target.insertAdjacentElement(
  "afterend",
  createButton("Click to throw error", () => {
    unsafeOperation("Error message thrown from JS");
  })
);

// eslint-disable-next-line import/no-unresolved, import/extensions
const invalid = require("./invalid.js");

console.log(invalid);
target.classList.add("pass");
target.innerHTML = "Success!";

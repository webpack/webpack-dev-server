"use strict";

/**
 *
 * @param {string} label
 * @param {string} errorMessage
 * @returns HTMLButtonElement
 */
module.exports = function createErrorButton(label, errorMessage) {
  function unsafeOperation() {
    throw new Error(errorMessage);
  }

  function handleButtonClick() {
    unsafeOperation();
  }

  const errorBtn = document.createElement("button");

  errorBtn.addEventListener("click", handleButtonClick);
  errorBtn.innerHTML = label;

  return errorBtn;
};

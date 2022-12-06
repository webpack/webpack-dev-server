"use strict";

function unsafeOperation() {
  throw new Error("Error message thrown from JS");
}

function handleButtonClick() {
  unsafeOperation();
}

module.exports = function createErrorButton() {
  const errorBtn = document.createElement("button");

  errorBtn.addEventListener("click", handleButtonClick);
  errorBtn.innerHTML = "Click to throw error";

  return errorBtn;
};

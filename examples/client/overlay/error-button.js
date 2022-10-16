"use strict";

module.exports = function createErrorButton() {
  const errorBtn = document.createElement("button");

  errorBtn.addEventListener("click", () => {
    throw new Error("runtime error!");
  });
  errorBtn.innerHTML = "Click to throw error";

  return errorBtn;
};

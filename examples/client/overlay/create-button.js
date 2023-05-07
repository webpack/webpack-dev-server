"use strict";

/**
 *
 * @param {string} label
 * @param {() => void} onClick
 * @returns HTMLButtonElement
 */
module.exports = function createButton(label, onClick) {
  const button = document.createElement("button");

  button.addEventListener("click", onClick);
  button.innerHTML = label;

  return button;
};

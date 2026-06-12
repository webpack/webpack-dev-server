/**
 * @param {string} label
 * @param {() => void} onClick
 * @returns HTMLButtonElement
 */
export default function createButton(label, onClick) {
  const button = document.createElement("button");

  button.addEventListener("click", onClick);
  button.innerHTML = label;

  return button;
}

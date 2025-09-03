"use strict";

const target = document.querySelector("#target");

function beforeunloadHandler(event) {
  event.preventDefault();
  event.returnValue = "";
  return "";
}

let isEventRegistered = false;

const addEventButton = document.createElement("button");
addEventButton.textContent = "Add Beforeunload Event";
addEventButton.style.cssText =
  "padding: 10px 20px; margin: 10px; font-size: 16px; cursor: pointer; background-color: #28a745; color: white; border: none; border-radius: 4px;";
addEventButton.addEventListener("click", function () {
  if (!isEventRegistered) {
    window.addEventListener("beforeunload", beforeunloadHandler);
    isEventRegistered = true;
    updateStatus();
    console.log("[webpack-dev-server] beforeunload event added");
  }
});

const reloadButton = document.createElement("button");
reloadButton.textContent = "Reload Page";
reloadButton.style.cssText =
  "padding: 10px 20px; margin: 10px; font-size: 16px; cursor: pointer; background-color: #007bff; color: white; border: none; border-radius: 4px;";
reloadButton.addEventListener("click", function () {
  window.location.reload();
});

const statusDisplay = document.createElement("div");
statusDisplay.style.cssText =
  "margin: 10px; padding: 10px; border: 2px solid #ccc; border-radius: 4px; font-weight: bold;";

function updateStatus() {
  statusDisplay.textContent = isEventRegistered
    ? "Status: Beforeunload event is ACTIVE - Page exit will be blocked"
    : "Status: Beforeunload event is INACTIVE - Page exit will not be blocked";
  statusDisplay.style.backgroundColor = isEventRegistered
    ? "#d4edda"
    : "#f8d7da";
  statusDisplay.style.borderColor = isEventRegistered ? "#28a745" : "#dc3545";
}

target.classList.add("pass");
target.innerHTML = "Beforeunload Event Controller";
target.appendChild(document.createElement("br"));
target.appendChild(document.createElement("br"));
target.appendChild(statusDisplay);
target.appendChild(document.createElement("br"));
target.appendChild(addEventButton);
target.appendChild(reloadButton);

updateStatus();

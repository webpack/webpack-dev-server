"use strict";

const target = document.querySelector("#target");

target.classList.add("pass");
target.innerHTML =
  "Success! <br> Now, open the console tab in your browser's devtools. Then, close the server with `Ctrl+C` to disconnect the client.";

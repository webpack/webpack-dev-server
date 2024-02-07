"use strict";

if (process.platform === "win32") {
  // eslint-disable-next-line no-console
  console.log("");
}

process.env.CHOKIDAR_USEPOLLING = true;

jest.setTimeout(300000);

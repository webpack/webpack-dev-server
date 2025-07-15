"use strict";

/* global test */

const isWindows = process.platform === "win32";

/**
 * @param {string} reason reason
 * @returns {boolean} true when it is windows, otherwise false
 */
function skipTestOnWindows(reason) {
  if (isWindows) {
    test.skip(reason, () => {});
  }

  return isWindows;
}

module.exports.skipTestOnWindows = skipTestOnWindows;

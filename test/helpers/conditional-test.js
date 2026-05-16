import { test } from "node:test";

const isWindows = process.platform === "win32";

/**
 * @param {string} reason reason
 * @returns {boolean} true when it is windows, otherwise false
 */
export function skipTestOnWindows(reason) {
  if (isWindows) {
    test.skip(reason, () => {});
  }

  return isWindows;
}

"use strict";

const path = require("path");
const os = require("os");
const { test, expect, mergeExpects } = require("@playwright/test");

/**
 * Returns a new string with all the EOL markers from the string passed in
 * replaced with the Operating System specific EOL marker.
 * Useful for guaranteeing two transform outputs have the same EOL marker format.
 * @param {string} input the string which will have its EOL markers replaced
 * @returns {string} a new string with all EOL markers replaced
 * @private
 */
const normalizeLineEndings = (input) => {
  return input.replace(/(\r\n|\n|\r)/gmu, os.EOL);
};

/**
 * Custom Playwright matcher to match a snapshot with an array.
 *
 * @function toMatchSnapshotWithArray
 * @memberof expect
 * @instance
 * @async
 * @param {Array} received - The received array that will be serialized and compared to the snapshot.
 * @param {string} name - The name of the snapshot file.
 * @returns {Promise<{message: function, pass: boolean, name: string, expected: Array, actual: *}>} - The result of the matcher.
 * @throws {Error} If the received value is not an array.
 */
const toMatchSnapshotWithArray = expect.extend({
  async toMatchSnapshotWithArray(received, name) {
    // find a better way or modify error message
    if (!["object", "number", "array", "string"].includes(typeof received)) {
      throw new Error(
        `Expected argument to be an object. but received ${typeof received}.`,
      );
    }

    const assertionName = "toMatchSnapshotWithArray";
    let pass;
    let matcherResult;

    const testInfo = test.info();

    const snapshotFileName = `${name}.snap.webpack5`;
    const snapshotFilePath = path.join(
      testInfo.titlePath.slice(1).join("."),
      snapshotFileName,
    );

    try {
      const serialized = normalizeLineEndings(JSON.stringify(received));
      await expect(serialized).toMatchSnapshot({
        name: snapshotFilePath,
      });
      pass = true;
    } catch (e) {
      matcherResult = e.matcherResult;
      pass = false;
    }

    /* eslint-disable no-undefined */
    const message = pass
      ? () =>
          `${this.utils.matcherHint(assertionName, undefined, undefined, {
            isNot: this.isNot,
          })}\n\n` +
          `Expected: ${this.isNot ? "not" : ""}${this.utils.printExpected(matcherResult.actual)}\n${
            matcherResult
              ? `Received: ${this.utils.printReceived(received)}`
              : ""
          }`
      : () =>
          `${this.utils.matcherHint(assertionName, undefined, undefined, {
            isNot: this.isNot,
          })}\n\n` +
          `Expected: ${this.utils.printExpected(matcherResult.actual)}\n${
            matcherResult
              ? `Received: ${this.utils.printReceived(received)}`
              : ""
          }`;

    return {
      message,
      pass,
      name: assertionName,
      expected: received,
      actual: matcherResult?.actual,
    };
  },
});

module.exports = {
  expect: mergeExpects(toMatchSnapshotWithArray),
};

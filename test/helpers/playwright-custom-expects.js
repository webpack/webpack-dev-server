"use strict";

const path = require("path");
const { test, expect, mergeExpects } = require("@playwright/test");

// TODO: clean and refactor it, check with the team about bypassing the undefined
const toMatchSnapshotWithArray = expect.extend({
  async toMatchSnapshotWithArray(received, name) {
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
      const serialized = JSON.stringify(received);
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

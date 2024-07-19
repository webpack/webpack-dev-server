"use strict";

const { expect, mergeExpects } = require('@playwright/test');

// TODO: clean and refactor it, check with the team about bypassing the undefined
const toMatchSnapshotWithArray = expect.extend({
  async toMatchSnapshotWithArray(received) {
    const assertionName = "toMatchSnapshotWithArray";
    let pass;
    let matcherResult;
    try {
      const serialized = JSON.stringify(received);
      await expect(serialized).toMatchSnapshot();
      pass = true;
    } catch (e) {
      matcherResult = e.matcherResult;
      pass = false;
    }

    const message = pass
      // eslint-disable-next-line no-undefined
      ? () => `${this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot })
        }\n\n` +
        `Expected: ${this.isNot ? 'not' : ''}${this.utils.printExpected(matcherResult.actual)}\n${
        matcherResult ? `Received: ${this.utils.printReceived(received)}` : ''}`
      // eslint-disable-next-line no-undefined
      : () =>  `${this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot })
        }\n\n` +
        `Expected: ${this.utils.printExpected(matcherResult.actual)}\n${
        matcherResult ? `Received: ${this.utils.printReceived(received)}` : ''}`;

    return {
      message,
      pass,
      name: assertionName,
      expected: received,
      actual: matcherResult?.actual
    }
  },
})

module.exports = {
  expect: mergeExpects(toMatchSnapshotWithArray)
};

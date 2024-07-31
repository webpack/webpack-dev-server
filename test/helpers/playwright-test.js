"use strict";

const { test, mergeTests } = require("@playwright/test");

const customTest = test.extend({
  done: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      let done;
      const donePromise = new Promise((resolve) => {
        done = resolve;
      });

      await use(done);

      return donePromise;
    },
    { option: true },
  ],
});

module.exports = { test: mergeTests(customTest) };

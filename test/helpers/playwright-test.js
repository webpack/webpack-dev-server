"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { test } = require("@playwright/test");

const istanbulCLIOutput = path.join(process.cwd(), ".nyc_output");

function generateUUID() {
  return crypto.randomBytes(16).toString("hex");
}

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
  context: async ({ context }, use) => {
    await context.addInitScript(() =>
      // eslint-disable-next-line no-undef
      window.addEventListener("beforeunload", () =>
        // eslint-disable-next-line no-undef
        window.collectIstanbulCoverage(JSON.stringify(window.__coverage__)),
      ),
    );
    await fs.promises.mkdir(istanbulCLIOutput, { recursive: true });
    await context.exposeFunction("collectIstanbulCoverage", (coverageJSON) => {
      if (coverageJSON) {
        fs.writeFileSync(
          path.join(
            istanbulCLIOutput,
            `playwright_coverage_${generateUUID()}.json`,
          ),
          coverageJSON,
        );
      }
    });
    await use(context);
    for (const page of context.pages()) {
      // eslint-disable-next-line no-await-in-loop
      await page.evaluate(() =>
        // eslint-disable-next-line no-undef
        window.collectIstanbulCoverage(JSON.stringify(window.__coverage__)),
      );
    }
  },
});

module.exports = { test: customTest };

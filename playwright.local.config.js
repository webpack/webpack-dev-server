"use strict";

/** @type { import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  globalSetup: require.resolve("./scripts/setupPlaywright.js"),
  testIgnore: "**/*.ignore.*",
  testDir: "./test/e2e",
  snapshotPathTemplate: "./test/e2e/__snapshots__/{testFilePath}/{arg}{ext}",
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.1,
    },
  },
  use: {
    trace: "on",
    // fixes: net::ERR_HTTP2_PROTOCOL_ERROR
    // https://github.com/webpack/webpack-dev-server/actions/runs/10043417455/job/27756147116#step:10:297
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: "chromium",
      use: {
        headless: true,
        browserName: "chromium",
      },
    },
  ],
};

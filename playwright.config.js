"use strict";

const MAX_RETRIES = 3;
const isCI = process.env.CI === "true";

/** @type { import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  globalSetup: require.resolve("./scripts/setupPlaywright.js"),
  testIgnore: "**/*.ignore.*",
  testDir: "./test/e2e",
  fullyParallel: false,
  forbidOnly: !isCI,
  retries: isCI ? MAX_RETRIES : 0,
  workers: 1,
  reporter: isCI ? "github" : "list",
  use: {
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        launchOptions: {
          args: ["--ignore-certificate-errors"],
        },
      },
    },
  ],
};

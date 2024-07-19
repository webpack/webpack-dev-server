"use strict";

module.exports = {
  globalSetup: require.resolve("./scripts/setupPlaywright.js"),
  testIgnore: "**/*.ignore.*",
  testDir: "./test/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  // TODO: can help with flakiness, make sure it works on CI
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
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

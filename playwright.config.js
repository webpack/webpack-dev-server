"use strict";

const CI = false;

module.exports = {
  testDir: "./test/e2e-playwright",
  // however this can have benefits, in tests I couldn't start a server on multiple ports
  // for tests "stats-refactored.test.js" the port is read from "ports-map.js" file somehow
  // I should manage to handle it if I want to run the tests in parallel mode
  fullyParallel: false,
  forbidOnly: !!CI,
  retries: CI ? 2 : 0,
  workers: 1,
  reporter: "html",
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
"use strict";

module.exports = {
  testIgnore: "**/*.ignore.*",
  testDir: "./test/e2e",
  outputDir: ".test/spec/output",
  snapshotPathTemplate:
    ".test/spec/snaps/{projectName}/{testFilePath}/{arg}{ext}",
  fullyParallel: false,
  forbidOnly: process.env.CI !== "true",
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

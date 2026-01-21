"use strict";

module.exports = {
  testEnvironmentOptions: {
    url: "http://localhost/",
  },
  collectCoverage: false,
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/test/",
    "<rootDir>/client/",
  ],
  testPathIgnorePatterns: ["<rootDir>/bin/this/process-arguments.js"],
  snapshotResolver: "<rootDir>/test/helpers/snapshotResolver.js",
  setupFilesAfterEnv: ["<rootDir>/scripts/setupTest.js"],
  globalSetup: "<rootDir>/scripts/globalSetupTest.js",
  moduleNameMapper: {
    // This forces Jest/jest-environment-jsdom to use a Node+CommonJS version of uuid, not a Browser+ESM one
    // See https://github.com/uuidjs/uuid/pull/616
    //
    // WARNING: if your dependency tree has multiple paths leading to uuid, this will force all of them to resolve to
    // whichever one happens to be hoisted to your root node_modules folder. This makes it much more dangerous
    // to consume future uuid upgrades. Consider using a custom resolver instead of moduleNameMapper.
    //
    // More:
    // https://jestjs.io/docs/upgrading-to-jest28#packagejson-exports
    // https://github.com/microsoft/accessibility-insights-web/pull/5421#issuecomment-1109168149
    //
  },
};

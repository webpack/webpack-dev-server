'use strict';

module.exports = {
  testURL: 'http://localhost/',
  collectCoverage: false,
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/test/',
    '<rootDir>/client/',
  ],
  testPathIgnorePatterns: ['<rootDir>/bin/this/process-arguments.js'],
  snapshotResolver: '<rootDir>/test/helpers/snapshotResolver.js',
  setupFilesAfterEnv: ['<rootDir>/setupTest.js'],
  globalSetup: '<rootDir>/globalSetupTest.js',
};

'use strict';

module.exports = {
  testURL: 'http://localhost/',
  collectCoverage: false,
  coveragePathIgnorePatterns: ['test', '<rootDir>/node_modules'],
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['**/test/e2e/Socket-injection.test.js'],
  setupFilesAfterEnv: ['<rootDir>/setupTest.js'],
  globalSetup: '<rootDir>/globalSetupTest.js',
  testSequencer: '<rootDir>/test/testSequencer.js',
};

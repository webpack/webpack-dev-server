'use strict';

module.exports = {
  testURL: 'http://localhost/',
  collectCoverage: false,
  coveragePathIgnorePatterns: ['test'],
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['**/test/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/setupTest.js'],
  globalSetup: '<rootDir>/globalSetupTest.js',
};

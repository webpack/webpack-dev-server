'use strict';

module.exports = {
  testURL: 'http://localhost/',
  collectCoverage: true,
  coveragePathIgnorePatterns: ['test'],
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['**/test/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/setupTest.js'],
};

'use strict';

module.exports = class BaseClient {
  // eslint-disable-next-line no-unused-vars
  static getClientPath(options) {
    throw new Error('Client needs implementation');
  }
};

'use strict';

/* eslint-disable
  no-unused-vars
*/
module.exports = class BaseClient {
  static getClientPath(options) {
    throw new Error('Client needs implementation');
  }
};

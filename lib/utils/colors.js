'use strict';

const colors = {
  /**
   * info color Method
   * @param {?boolean} useColor - use color with your message
   * @param {string} msg - Your log message
   * @returns {string}
   */
  info(useColor, msg) {
    if (useColor) {
      // Make text blue and bold, so it *pops*
      return `\u001b[1m\u001b[34m${msg}\u001b[39m\u001b[22m`;
    }

    return msg;
  },
  /**
   * error color Method
   * @param {?boolean} useColor - use color with your message
   * @param {string} msg - Your log message
   * @returns {string}
   */
  error(useColor, msg) {
    if (useColor) {
      // Make text red and bold, so it *pops*
      return `\u001b[1m\u001b[31m${msg}\u001b[39m\u001b[22m`;
    }

    return msg;
  },
};

module.exports = colors;

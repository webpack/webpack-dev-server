'use strict';

function checkUrl(url) {
  return /^(https?:)?\/\//.test(url);
}

module.exports = checkUrl;

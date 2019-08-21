'use strict';

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

module.exports = isObject;

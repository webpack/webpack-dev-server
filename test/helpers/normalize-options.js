"use strict";

function normalizeOptions(options) {
  const normalizedOptions = {};

  // eslint-disable-next-line guard-for-in
  for (const propertyName in options) {
    let value = options[propertyName];

    if (Array.isArray(value)) {
      value = value.map((item) => {
        if (Buffer.isBuffer(item)) {
          return "<Buffer>";
        }

        return item;
      });
    } else if (Buffer.isBuffer(value)) {
      value = "<Buffer>";
    }

    normalizedOptions[propertyName] = value;
  }

  return normalizedOptions;
}

module.exports = normalizeOptions;

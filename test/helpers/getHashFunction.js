"use strict";

const isNode17 = process.version.startsWith("v17");

const getHashFunction = () => (isNode17 ? "xxhash64" : "md4");

module.exports = getHashFunction;

"use strict";

const webpack = require("webpack");

const isWebpack5 = webpack.version[0] === "5";

module.exports = isWebpack5;

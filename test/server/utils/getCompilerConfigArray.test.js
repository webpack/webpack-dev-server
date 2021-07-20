"use strict";

const webpack = require("webpack");
const getCompilerConfigArray = require("../../../lib/utils/getCompilerConfigArray");
const isWebpack5 = require("../../helpers/isWebpack5");

describe("getCompilerConfigArray", () => {
  it("should get config array from single compiler", () => {
    const compiler = webpack({
      stats: "errors-only",
    });
    const configArr = getCompilerConfigArray(compiler);
    expect(configArr.length).toEqual(1);
    const stats = configArr[0].stats;
    if (isWebpack5) {
      expect(stats).toEqual({
        preset: "errors-only",
      });
    } else {
      expect(stats).toEqual("errors-only");
    }
  });

  it("should get config array from multi compiler", () => {
    const compiler = webpack([
      {
        stats: "none",
      },
      {
        stats: "errors-only",
      },
    ]);
    const configArr = getCompilerConfigArray(compiler);
    expect(configArr.length).toEqual(2);
    if (isWebpack5) {
      expect(configArr[0].stats).toEqual({
        preset: "none",
      });
      expect(configArr[1].stats).toEqual({
        preset: "errors-only",
      });
    } else {
      expect(configArr[0].stats).toEqual("none");
      expect(configArr[1].stats).toEqual("errors-only");
    }
  });
});

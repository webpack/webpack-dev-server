"use strict";

const { getIgnoreMatchers } = require("../../lib/getGlobMatchers");

describe("getIgnoreMatchers", () => {
  it("should return an array of matchers for glob strings", () => {
    const watchOptions = {
      cwd: process.cwd(),
      ignored: ["src/*.js", "tests/*.spec.js"],
    };
    const matchers = getIgnoreMatchers(watchOptions, null);

    expect(matchers).toHaveLength(1);
    expect(typeof matchers[0]).toBe("function");
  });

  it("should return the original value for non-glob strings", () => {
    const watchOptions = { cwd: process.cwd(), ignored: "src/file.txt" };
    const matchers = getIgnoreMatchers(watchOptions, null);

    expect(matchers).toHaveLength(1);
    expect(matchers[0]).toBe("src/file.txt");
  });

  it("should return empty array if ignored is not defined", () => {
    const watchOptions = { cwd: process.cwd() };
    const matchers = getIgnoreMatchers(watchOptions, null);

    expect(matchers).toEqual([]);
  });

  it("should return an array that includes the passed matcher function", () => {
    const watchOptions = { cwd: process.cwd() };
    const ignoreFunction = () => true;
    const matchers = getIgnoreMatchers(watchOptions, ignoreFunction);

    expect(matchers).toHaveLength(1);
    expect(matchers[0]).toBe(ignoreFunction);
  });

  it("should return all original value and only replace all globs with one function", () => {
    const ignoreFunction = () => true;
    const regex = /src\/.*\.js/;
    const watchOptions = {
      cwd: process.cwd(),
      ignored: [
        "src/*.js",
        "src/file.txt",
        "src/**/*.js",
        ignoreFunction,
        regex,
      ],
    };

    const matchers = getIgnoreMatchers(watchOptions, ignoreFunction);

    expect(matchers).toHaveLength(5);
    expect(matchers[0]).toBe("src/file.txt");
    expect(matchers[1]).toBe(ignoreFunction);
    expect(matchers[2]).toBe(regex);
    expect(matchers[3]).toBe(ignoreFunction);
    expect(typeof matchers[4]).toBe("function");
  });

  it("should work with complicated glob", () => {
    const watchOptions = {
      cwd: process.cwd(),
      ignored: ["src/**/components/*.js"],
    };
    const matchers = getIgnoreMatchers(watchOptions, null);

    expect(matchers).toHaveLength(1);
    expect(typeof matchers[0]).toBe("function");

    const filePath = "src/components/file.txt";
    expect(matchers[0](filePath)).toBe(false);

    const jsFilePath = "src/components/file.js";
    expect(matchers[0](jsFilePath)).toBe(true);

    const jsFilePath2 = "src/other/components/file.js";
    expect(matchers[0](jsFilePath2)).toBe(true);

    const nestedJsFilePath = "src/components/nested/file.js";
    expect(matchers[0](nestedJsFilePath)).toBe(false);
  });

  it("should work with negated glob", () => {
    const watchOptions = {
      cwd: process.cwd(),
      ignored: ["src/**/components/!(*.spec).js"],
    };
    const matchers = getIgnoreMatchers(watchOptions, null);

    expect(matchers).toHaveLength(1);
    expect(typeof matchers[0]).toBe("function");

    const filePath = "src/components/file.txt";
    expect(matchers[0](filePath)).toBe(false);

    const jsFilePath = "src/components/file.js";
    expect(matchers[0](jsFilePath)).toBe(true);

    const specJsFilePath = "src/components/file.spec.js";
    expect(matchers[0](specJsFilePath)).toBe(false);
  });

  it("should work with directory glob", () => {
    const watchOptions = { cwd: process.cwd(), ignored: ["src/**"] };
    const matchers = getIgnoreMatchers(watchOptions, null);

    expect(matchers).toHaveLength(1);
    expect(typeof matchers[0]).toBe("function");

    const filePath = "src/file.txt";
    expect(matchers[0](filePath)).toBe(true);

    const dirPath = "src/subdir";
    expect(matchers[0](dirPath)).toBe(true);

    const nestedFilePath = "src/subdir/nested/file.txt";
    expect(matchers[0](nestedFilePath)).toBe(true);

    const wrongPath = "foo/bar";
    expect(matchers[0](wrongPath)).toBe(false);
  });

  it("should work with directory glob and file extension", () => {
    const watchOptions = { cwd: process.cwd(), ignored: ["src/**/*.{js,ts}"] };
    const matchers = getIgnoreMatchers(watchOptions, null);

    expect(matchers).toHaveLength(1);
    expect(typeof matchers[0]).toBe("function");

    const jsFilePath = "src/file.js";
    expect(matchers[0](jsFilePath)).toBe(true);

    const tsFilePath = "src/file.ts";
    expect(matchers[0](tsFilePath)).toBe(true);

    const txtFilePath = "src/file.txt";
    expect(matchers[0](txtFilePath)).toBe(false);

    const nestedJsFilePath = "src/subdir/nested/file.js";
    expect(matchers[0](nestedJsFilePath)).toBe(true);
  });

  it("should return the input as array when globbing is disabled", () => {
    const watchOptions = {
      cwd: process.cwd(),
      disableGlobbing: true,
      ignored: "src/**/*.{js,ts}",
    };
    const matchers = getIgnoreMatchers(watchOptions, null);

    expect(matchers).toHaveLength(1);
    expect(matchers[0]).toBe("src/**/*.{js,ts}");
  });
});

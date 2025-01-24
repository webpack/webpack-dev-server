"use strict";

const { getGlobbedWatcherPaths } = require("../../lib/getGlobMatchers");

describe("getGlobbedWatcherPaths", () => {
  it("should watch the parent directory of the glob", () => {
    const glob = "src/*.js";
    const watchOptions = { cwd: process.cwd() };
    const [watchPaths] = getGlobbedWatcherPaths(glob, watchOptions);

    expect(watchPaths).toEqual(["src"]);
  });

  it("should ignore files that are not part of the glob", () => {
    const glob = "src/*.js";
    const watchOptions = { cwd: process.cwd() };
    const [, ignoreFunction] = getGlobbedWatcherPaths(glob, watchOptions);

    const filePath = "src/file.txt";
    expect(ignoreFunction(filePath)).toBe(true);

    const jsFilePath = "src/file.js";
    expect(ignoreFunction(jsFilePath)).toBe(false);
  });

  it("should work with multiple globs", () => {
    const globs = ["src/*.js", "tests/*.spec.js"];
    const watchOptions = { cwd: process.cwd() };
    const [watchPaths, ignoreFunction] = getGlobbedWatcherPaths(
      globs,
      watchOptions,
    );

    expect(watchPaths).toEqual(["src", "tests"]);

    const filePath = "src/file.txt";
    expect(ignoreFunction(filePath)).toBe(true);

    const jsFilePath = "src/file.js";
    expect(ignoreFunction(jsFilePath)).toBe(false);

    const specFilePath = "tests/file.spec.js";
    expect(ignoreFunction(specFilePath)).toBe(false);
  });

  it("should work with complicated glob", () => {
    const glob = "src/**/components/*.js";
    const watchOptions = { cwd: process.cwd() };
    const [watchPaths, ignoreFunction] = getGlobbedWatcherPaths(
      glob,
      watchOptions,
    );

    expect(watchPaths).toEqual(["src"]);

    const filePath = "src/components/file.txt";
    expect(ignoreFunction(filePath)).toBe(true);

    const jsFilePath = "src/components/file.js";
    expect(ignoreFunction(jsFilePath)).toBe(false);

    const nestedJsFilePath = "src/components/nested/file.js";
    expect(ignoreFunction(nestedJsFilePath)).toBe(true);
  });

  it("should work with negated glob", () => {
    const glob = "src/**/components/!(*.spec).js";
    const watchOptions = { cwd: process.cwd() };
    const [watchPaths, ignoreFunction] = getGlobbedWatcherPaths(
      glob,
      watchOptions,
    );

    expect(watchPaths).toEqual(["src"]);

    const filePath = "src/components/file.txt";
    expect(ignoreFunction(filePath)).toBe(true);

    const jsFilePath = "src/components/file.js";
    expect(ignoreFunction(jsFilePath)).toBe(false);

    const specJsFilePath = "src/components/file.spec.js";
    expect(ignoreFunction(specJsFilePath)).toBe(true);
  });

  it("should work with directory glob", () => {
    const glob = "src/**";
    const watchOptions = { cwd: process.cwd() };
    const [watchPaths, ignoreFunction] = getGlobbedWatcherPaths(
      glob,
      watchOptions,
    );

    expect(watchPaths).toEqual(["src"]);

    const filePath = "src/file.txt";
    expect(ignoreFunction(filePath)).toBe(false);

    const dirPath = "src/subdir";
    expect(ignoreFunction(dirPath)).toBe(false);

    const nestedFilePath = "src/subdir/nested/file.txt";
    expect(ignoreFunction(nestedFilePath)).toBe(false);
  });

  it("should work with directory glob and file extension", () => {
    const glob = "src/**/*.{js,ts}";
    const watchOptions = { cwd: process.cwd() };
    const [watchPaths, ignoreFunction] = getGlobbedWatcherPaths(
      glob,
      watchOptions,
    );

    expect(watchPaths).toEqual(["src"]);

    const jsFilePath = "src/file.js";
    expect(ignoreFunction(jsFilePath)).toBe(false);

    const tsFilePath = "src/file.ts";
    expect(ignoreFunction(tsFilePath)).toBe(false);

    const txtFilePath = "src/file.txt";
    expect(ignoreFunction(txtFilePath)).toBe(true);

    const nestedJsFilePath = "src/subdir/nested/file.js";
    expect(ignoreFunction(nestedJsFilePath)).toBe(false);
  });

  it("should return the input as array when globbing is disabled", () => {
    const glob = "src/**/*.{js,ts}";
    const watchOptions = { cwd: process.cwd(), disableGlobbing: true };
    const [watchPaths, ignoreFunction] = getGlobbedWatcherPaths(
      glob,
      watchOptions,
    );

    expect(watchPaths).toEqual(["src/**/*.{js,ts}"]);
    expect(ignoreFunction).toBe(null);
  });
});

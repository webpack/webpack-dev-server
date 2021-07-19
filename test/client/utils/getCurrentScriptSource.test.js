/**
 * @jest-environment jsdom
 */

"use strict";

const getCurrentScriptSource = require("../../../client-src/utils/getCurrentScriptSource");

describe("'getCurrentScriptSource' function", () => {
  afterEach(() => {
    Object.defineProperty(document, "currentScript", {
      // eslint-disable-next-line no-undefined
      value: undefined,
      writable: true,
    });
    Object.defineProperty(document, "scripts", {
      value: [],
      writable: true,
    });
  });

  test("should fail when 'document.currentScript' doesn't exist and no 'script' tags", () => {
    try {
      getCurrentScriptSource();
    } catch (error) {
      expect(error).toMatchSnapshot();
    }
  });

  test("should return src when 'document.currentScript' exists", () => {
    const elm = document.createElement("script");

    elm.setAttribute("src", "foo");

    Object.defineProperty(document, "currentScript", {
      value: elm,
    });

    expect(getCurrentScriptSource()).toEqual("foo");
  });

  test("should fail when 'document.scripts' doesn't exist and no scripts", () => {
    Object.defineProperty(document, "scripts", {
      // eslint-disable-next-line no-undefined
      value: undefined,
      writable: true,
    });

    try {
      getCurrentScriptSource();
    } catch (error) {
      expect(error).toMatchSnapshot();
    }
  });

  test("should return the 'src' attribute of the last 'script' tag", () => {
    const elements = ["foo", "bar"].map((src) => {
      const element = document.createElement("script");

      element.setAttribute("src", src);

      return element;
    });

    Object.defineProperty(document, "scripts", {
      value: elements,
    });

    expect(getCurrentScriptSource()).toEqual("bar");
  });

  test("should fail when no scripts with the 'scr' attribute", () => {
    const elements = ["foo", "bar"].map(() => document.createElement("script"));

    Object.defineProperty(document, "scripts", {
      value: elements,
    });

    try {
      getCurrentScriptSource();
    } catch (error) {
      expect(error).toMatchSnapshot();
    }
  });
});

/**
 * @jest-environment jsdom
 */

"use strict";

describe("'getCurrentScriptSource' function", () => {
  let getCurrentScriptSource;

  beforeEach(() => {
    globalThis.__webpack_hash__ = "mock-hash";
    globalThis.__resourceQuery = "?protocol=ws&hostname=0.0.0.0";

    getCurrentScriptSource =
      require("../../../client-src/index").getCurrentScriptSource;
  });

  afterEach(() => {
    Object.defineProperty(document, "currentScript", {
      value: undefined,
      writable: true,
    });
    Object.defineProperty(document, "scripts", {
      value: [],
      writable: true,
    });
  });

  it("should fail when 'document.currentScript' doesn't exist and no 'script' tags", () => {
    try {
      getCurrentScriptSource();
    } catch (error) {
      expect(error).toMatchSnapshot();
    }
  });

  it("should return src when 'document.currentScript' exists", () => {
    const elm = document.createElement("script");

    elm.setAttribute("src", "foo");

    Object.defineProperty(document, "currentScript", {
      value: elm,
    });

    expect(getCurrentScriptSource()).toBe("foo");
  });

  it("should fail when 'document.scripts' doesn't exist and no scripts", () => {
    Object.defineProperty(document, "scripts", {
      value: undefined,
      writable: true,
    });

    try {
      getCurrentScriptSource();
    } catch (error) {
      expect(error).toMatchSnapshot();
    }
  });

  it("should return the 'src' attribute of the last 'script' tag", () => {
    const elements = ["foo", "bar"].map((src) => {
      const element = document.createElement("script");

      element.setAttribute("src", src);

      return element;
    });

    Object.defineProperty(document, "scripts", {
      value: elements,
    });

    expect(getCurrentScriptSource()).toBe("bar");
  });

  it("should fail when no scripts with the 'scr' attribute", () => {
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

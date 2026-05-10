"use strict";

require("../../helpers/jsdom-setup");

const { describe, it } = require("node:test");
const { expect } = require("expect");
const { spyOn } = require("jest-mock");
const sendMessage = require("../../../client-src/utils/sendMessage").default;

describe("'sendMessage' function", () => {
  it("should run self.postMessage", (t) => {
    spyOn(globalThis, "postMessage").mockImplementation();

    sendMessage("foo", "bar");

    expect(self.postMessage).toHaveBeenCalled();
    t.assert.snapshot(self.postMessage.mock.calls[0]);
  });
});

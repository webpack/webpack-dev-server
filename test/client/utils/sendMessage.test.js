/**
 * @jest-environment jsdom
 */

"use strict";

const sendMessage = require("../../../client-src/utils/sendMessage").default;

describe("'sendMessage' function", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should run self.postMessage", () => {
    jest.spyOn(globalThis, "postMessage").mockImplementation();

    sendMessage("foo", "bar");

    expect(self.postMessage).toHaveBeenCalled();
    expect(self.postMessage.mock.calls[0]).toMatchSnapshot();
  });
});

/**
 * @jest-environment jsdom
 */

"use strict";

const sendMessage = require("../../../client-src/utils/sendMessage").default;

describe("'sendMessage' function", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should run self.postMessage", () => {
    self.postMessage = jest.fn();

    sendMessage("foo", "bar");

    expect(self.postMessage).toBeCalled();
    expect(self.postMessage.mock.calls[0]).toMatchSnapshot();
  });
});

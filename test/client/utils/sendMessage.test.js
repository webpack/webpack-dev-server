import "../../helpers/jsdom-setup.js";

import { describe, it } from "node:test";
import { expect } from "expect";
import { spyOn } from "jest-mock";
import sendMessage from "../../../client-src/utils/sendMessage.js";

describe("'sendMessage' function", () => {
  it("should run self.postMessage", (t) => {
    spyOn(globalThis, "postMessage").mockImplementation();

    sendMessage("foo", "bar");

    expect(self.postMessage).toHaveBeenCalled();
    t.assert.snapshot(self.postMessage.mock.calls[0]);
  });
});

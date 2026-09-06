import "../helpers/jsdom-setup.js";

import { afterEach, describe, it } from "node:test";
import { expect } from "expect";
import { hide, show } from "webpack-dev-middleware/client/indicator";
import { hideProgress, showProgress } from "../../client-src/progress.js";

const selector = "#webpack-dev-middleware-building-indicator";

describe("progress", () => {
  afterEach(() => hide());

  it("should display progress and remove the indicator on completion", () => {
    showProgress(25, "building");
    const indicator = document.querySelector(selector);
    expect(indicator.shadowRoot.textContent).toContain("25% - building");
    expect(indicator.shadowRoot.querySelector("svg").style.display).toBe(
      "block",
    );

    showProgress(100, "completed");
    expect(document.querySelector(selector)).toBeNull();

    showProgress(10, "rebuilding");
    expect(document.querySelector(selector).shadowRoot.textContent).toContain(
      "10% - rebuilding",
    );
  });

  it("should preserve another client's indicator when this client finishes", () => {
    show("Other build", 10, "other-client");
    showProgress(50, "building");
    hideProgress();
    expect(document.querySelector(selector)).not.toBeNull();
    hide("other-client");
    expect(document.querySelector(selector)).toBeNull();
  });
});

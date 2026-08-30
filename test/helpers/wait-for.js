/**
 * Polls `predicate` until it returns a truthy value.
 *
 * E2E assertions frequently depend on work the page keeps doing after the
 * navigation settles - a web worker posting a message, the client logging a
 * reconnect, the server dropping a dead socket. Snapshotting straight after
 * `page.goto()` races with that work, and a fixed delay is either flaky on a
 * slow CI runner or wasted time on a fast one. Waiting for the observable
 * result is both stable and quick. Node's per-test timeout bounds the wait, so
 * a condition that never becomes true still fails the test.
 * @param {() => boolean} predicate condition to wait for
 * @param {number=} interval poll interval in milliseconds
 * @returns {Promise<void>} resolves once `predicate` returns a truthy value
 */
export default function waitFor(predicate, interval = 50) {
  return new Promise((resolve) => {
    if (predicate()) {
      resolve();

      return;
    }

    const timer = setInterval(() => {
      if (!predicate()) return;

      clearInterval(timer);
      resolve();
    }, interval);
  });
}

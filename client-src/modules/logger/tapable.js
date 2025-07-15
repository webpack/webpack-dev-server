/**
 * @returns {SyncBailHook} mocked sync bail hook
 * @constructor
 */
function SyncBailHook() {
  return {
    call() {},
  };
}

/**
 * Client stub for tapable SyncBailHook
 */
export { SyncBailHook };

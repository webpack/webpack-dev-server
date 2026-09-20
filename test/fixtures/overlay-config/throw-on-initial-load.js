// Throws while the entry is still evaluating, i.e. before the client's socket
// handshake completes. Compilation succeeds, so the handshake reports `ok`.
throw new Error("Injected error");

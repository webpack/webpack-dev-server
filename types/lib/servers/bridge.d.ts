/**
 * Wrap a `BaseServer` implementation as a transport.
 * @param {EXPECTED_ANY} instance the implementation, already constructed
 * @returns {EXPECTED_ANY} the transport the middleware asked for
 */
export default function bridge(instance: EXPECTED_ANY): EXPECTED_ANY;
export type ClientConnection = import("../Server.js").ClientConnection;
export type EXPECTED_ANY = any;

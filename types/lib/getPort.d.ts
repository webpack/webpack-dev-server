export = getPorts;
/**
 * @param {number} basePort base port
 * @param {string=} host host
 * @returns {Promise<number>} resolved port
 */
declare function getPorts(
  basePort: number,
  host?: string | undefined,
): Promise<number>;

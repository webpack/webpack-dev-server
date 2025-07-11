export = getPorts;
/**
 * @param {number} basePort
 * @param {string=} host
 * @returns {Promise<number>}
 */
declare function getPorts(
  basePort: number,
  host?: string | undefined,
): Promise<number>;

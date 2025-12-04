/**
 * Shared utility functions
 */

/**
 * Simple 32-bit hash function for generating IDs
 * @param {string} str - String to hash
 * @returns {string} Base-36 encoded hash
 */
function hash32(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

module.exports = {
  hash32
};

'use strict';

/**
 * A function that garners an object from a given response.
 * @function createTotalEntry
 * @param {Object} rs - The response object, it should contain `GROUP1` & `AMOUNT1` properties.
 * @returns {Object} - Returns an object with properties `name` and `value`.
 */


function createTotalEntry(rs) {
  return {
    'name': rs.GROUP1,
    'value': rs.AMOUNT1
  };
}

module.exports = { createTotalEntry };

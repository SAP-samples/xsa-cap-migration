'use strict';

/**
 * This function creates a filter entry with given parameters.
 * @function createFilterEntry
 * @param {Array} rs - The terms of the filter.
 * @param {string} attribute - The attribute of the filter.
 * @param {string} obj - The category of the filter.
 * @returns {Object} - The filter entry.
 */

function createFilterEntry(rs, attribute, obj) {
  return {
    'terms': rs,
    'attribute': attribute,
    'category': obj
  };
}

module.exports = { createFilterEntry };

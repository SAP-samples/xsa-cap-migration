'use strict';
const cds = require('@sap/cds');

/**
 * An asynchronous function that retrieves the sizes of all tables in the database.
 * @async
 * @function getDBTableSize
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @returns {Promise} A promise that resolves to an array containing information about all tables in the database.
*/

async function getDBTableSize(req) {
  try {
    const query = 'SELECT * from "GETTABLESIZE"()';
    return cds.run(query);
  }
  catch (e) {
    return req.error(
      500,
      `Error in getting table sizes: ${ e.message }`
    );
  }
}

module.exports = { getDBTableSize };

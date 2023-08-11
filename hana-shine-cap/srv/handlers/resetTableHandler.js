'use strict';
const cds = require('@sap/cds');

/**
 * An asynchronous function to reset a table in the database.
 * @async
 * @function resetTable
 * @param {string} origTable - The name of the original table to be reset.
 * @param {string} shadowTable - The name of the shadow table from which to copy data.
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @returns {Promise} - Returns a string with success message in case of successful reset, otherwise, rejects with an error.
 */

async function resetTable(origTable, shadowTable, req) {
  try {
    const trquery = 'truncate table "' + origTable + '"';
    await cds.run(trquery);
    const inquery = 'insert into "' + origTable + '" select * from "' + shadowTable + '"';
    await cds.run(inquery);
    return `${ origTable } reloaded successfully`
  }
  catch (e) {
    return req.error(
      500,
      `Error in resetTable: ${ e.message }`
    )
  }
}

module.exports = { resetTable };

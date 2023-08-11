'use strict';
const cds = require('@sap/cds');

/**
 * An asynchronous function that generates time dimensional data by running some SQL queries and a stored procedure.
 * @async
 * @function generateTimeData
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @returns {Promise} Promise resolving to an info object if the time dimensional data is generated successfully or promise rejecting with an error message when the time dimensional data generation fails.
*/

async function generateTimeData(req) {
  try {
    const result = await cds.run('SELECT CURRENT_SCHEMA, YEAR(CURRENT_DATE) AS CURRENT_YEAR FROM "DUMMY"');
    const { CURRENT_SCHEMA, CURRENT_YEAR } = result[0];
    const endYear = CURRENT_YEAR;
    const targetSchema = CURRENT_SCHEMA;
    const targetTable = 'CORE_SHINE_TIME_DIM';
    const sql = `CALL "PUBLIC"."UPDATE_TIME_DIMENSION"('HOUR', 2017, ${ endYear }, 0 , '${ targetSchema }', '${ targetTable }', ?)`;
    const output = await cds.run(sql);
    const recordCount = output['RECORD_COUNT'];
    return req.info(
      200,
      `${ recordCount } Records of Time Dimensional Data Generated successfully`
    )
  }
  catch (e) {
    return req.error(
      500,
      `Time Dimensional Data not generated: ${ e.message }`
    );
  }
}

module.exports = { generateTimeData };

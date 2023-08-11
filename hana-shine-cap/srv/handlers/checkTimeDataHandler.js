'use strict';
/**
 * Asynchronous function that checks if data is available in the "CORE_SHINE_TIME_DIM" table.
 * @async
 * @function checkTimeData
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @returns {Promise<Object>} A promise that resolves to an object representing the HTTP response message.
 */

async function checkTimeData(req) {
  try {
    const result = await SELECT.from('CORE_SHINE_TIME_DIM').limit(1);
    if (result && result.length > 0) {
      return req.info(
        200,
        'Data available'
      );
    }
    else {
      return req.error(
        404,
        'Data unavailable'
      );
    }
  }
  catch (error) {
    return req.error(
      500,
      `Error in checkTimeData: ${ error.message }`
    );
  }
}

module.exports = { checkTimeData };

'use strict';

/**
 * An asynchronous function that retrieves sales data for a specific business partner.
 * @async
 * @function getBPSalesData
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @param {Object} srv - The CAP service Object.
 * @returns {Promise} A promise that resolves to an object with 'salesTotal' and 'salesYoY' properties or rejects with an error response.
*/

async function getBPSalesData(req, srv) {
  const { so_details } = srv.entities;
  const bpId = req.data.bpId;
  const output = {};
  try {
    const result = await SELECT.from(so_details).columns('SUM(GROSSAMOUNT) AS AMOUNT').where({ 'PARTNER_PARTNERID': bpId });
    if (result.length < 1) {
      return req.error(
        500,
        'Failed to retrieve BP Sales data'
      )
    }
    else {
      output.salesTotal = result[0].AMOUNT;
    }
    if (output.salesTotal !== null) {
      const resultsales = await SELECT.from(so_details).columns([ 'SUM(GROSSAMOUNT) AS AMOUNT', 'YEAR(HISTORY_CREATEDAT) AS YEAR' ]).where({ 'PARTNER_PARTNERID': bpId }).groupBy('YEAR(HISTORY_CREATEDAT)').orderBy('YEAR(HISTORY_CREATEDAT)');
      if (resultsales.length < 1) {
        return req.error(
          500,
          'Failed to retrieve BP Sales data'
        )
      }
      else {
        output.salesYoY = resultsales.map(({ AMOUNT, YEAR }) => {
          return {
            amount: AMOUNT,
            year: YEAR,
            currency: 'EUR'
          };
        });
      }
    }
    return output;
  }
  catch (e) {
    return req.error(
      500,
      `Failed to retrieve BP Sales data: ${ e.message }`
    )
  }
}

module.exports = { getBPSalesData };

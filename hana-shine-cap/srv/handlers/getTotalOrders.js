'use strict';
const cds = require('@sap/cds');
const createTotalEntry = require('./createTotalEntryHandler').createTotalEntry;

/**
 * An asynchronous function that fetches the total orders from the database and groups them based on the provided group condition and currency.
 * It returns the top 5 groups sorted in descending order of the summed converted gross amount.
 * @async
 * @function getTotalOrders
 * @param {Object} req - The request object carrying all details of the incoming request. It contains a 'data' field with properties: 'groupby' (determines the grouping condition) and 'currency' (optional, used as the currency code in the response)
 * @returns {Promise<Object>|Error} - A promise that resolves to an object containing total orders grouped based on the provided conditions. Sends an HTTP response with status code 400 for client errors and 500 for server errors.
*/


async function getTotalOrders(req) {
  const ivGroupBy = req.data.groupby;
  const ivCurrency = (req.data.currency || 'EUR').substring(0, 3);
  let list = [];
  const allowedGroupBy = [ 'COMPANYNAME', 'CATEGORY', 'CITY', 'POSTALCODE', 'PRODUCTID' ];
  if (!allowedGroupBy.includes(ivGroupBy)) {
    return req.error(
      400,
      'Invalid Group By Condition'
    );
  }
  const CheckUpperCase = new RegExp('[A-Z]{3}');
  if (CheckUpperCase.test(ivCurrency) === true) {
    try {
      const query = 'SELECT TOP 5 ' + ivGroupBy + ' AS GROUP1, SUM("CONVGROSSAMOUNT") AS AMOUNT1 FROM "SAP_HANA_DEMOCONTENT_EPM_MODELS_PURCHASE_COMMON_CURRENCY"' + ' (\'PLACEHOLDER\' = (\'$$IP_O_TARGET_CURRENCY$$\', \'' + ivCurrency + '\')) group by ' + ivGroupBy + ' order by sum("CONVGROSSAMOUNT") desc';
      const result = await cds.run(query);
      list = result.map(row => createTotalEntry(row));
    }
    catch (error) {
      return req.error(
        500,
        `Internal server error during getTotalOrders: ${ error.message }`
      )
    }
    return {
      'entries': list
    };
  }
  else {
    return req.error(
      400,
      'Invalid Currency Code'
    )
  }
}
module.exports = { getTotalOrders };

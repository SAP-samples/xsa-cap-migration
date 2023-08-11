'use strict';
const cds = require('@sap/cds');

/**
 * An asynchronous function that retrieves transaction data for a specific business partner and calculates the relative distance for the user's location.
 * @async
 * @function getBPTransactionData
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @param {Object} srv - The CAP service Object.
 * @returns {Promise} A promise that resolves to an object with the 'salesTotal', 'salesYoY', and 'distance' properties or rejects with an error response.
*/

async function getBPTransactionData(req, srv) {
  const { so_details } = srv.entities;
  const bpId = req.data.bpId;
  const latitude = req.data.lat;
  const longitude = req.data.long;
  const userLatitude = req.data.userlat;
  const userLongitude = req.data.userlong;
  const output = {};
  let query;
  try {
    const result = await SELECT.from(so_details).columns('SUM(GROSSAMOUNT) AS AMOUNT').where({ 'PARTNER_PARTNERID': bpId });
    if (result.length < 1) {
      return req.error(
        500,
        'Failed to retrieve BP Transaction data'
      )
    }
    else {
      output.salesTotal = result[0].AMOUNT;
    }
    if (output.salesTotal !== null) {
      const resultYoY = await SELECT.from(so_details).columns([ 'SUM(GROSSAMOUNT) AS AMOUNT', 'YEAR(HISTORY_CREATEDAT) AS YEAR' ]).where({ 'PARTNER_PARTNERID': bpId }).groupBy('YEAR(HISTORY_CREATEDAT)').orderBy('YEAR(HISTORY_CREATEDAT)');
      if (resultYoY.length < 1) {
        return req.error(
          500,
          'Failed to retrieve BP Transaction data'
        )
      }
      else {
        output.salesYoY = resultYoY.map(({ AMOUNT, YEAR }) => {
          return {
            amount: AMOUNT,
            year: YEAR,
            currency: 'EUR'
          };
        });
      }
    }
    if ( !isNaN(longitude) && !isNaN(latitude) && !isNaN(userLongitude) && !isNaN(userLatitude)) {
      query = 'select NEW ST_Point(\'POINT(' + userLongitude + ' ' + userLatitude + ')\',4326 ).ST_Distance( NEW ST_Point(\'POINT(' + longitude + ' ' + latitude + ')\',4326 ),\'meter\')' +
            'AS DISTANCE  from "SAP_HANA_DEMOCONTENT_EPM_SPATIAL_MODELS_BP_ADDRESS_DETAILS"';
      const geoPoints = await cds.run(query);
      if (geoPoints.length < 1) {
        return req.error(
          500,
          'Failed to retrieve data'
        )
      }
      else {
        output.distance = geoPoints[0].DISTANCE;
      }
    }
    return output;
  }
  catch (e) {
    return req.error(
      500,
      `Failed to retrieve BP Transaction data: ${ e.message }`
    )
  }
}

module.exports = { getBPTransactionData };

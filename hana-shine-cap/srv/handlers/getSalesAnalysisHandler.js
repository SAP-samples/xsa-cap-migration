'use strict';

const cds = require('@sap/cds');

/**
 * An asynchronous function that performs sales analysis based on the provided geographical polygon.
 * @async
 * @function getSalesAnalysis
 * @param {Object} req - The request object carrying all details of the incoming request. It contains a data field which holds the polygon points data.
 * @returns {Promise<Object>} A promise that resolves to an object containing total sales, top buyers, and sales year over year within the polygon. The object includes fields: totalSales, topBuyers[], and salesYoY[] and rejects with a message in case of error.
*/

async function getSalesAnalysis(req) {
  try {
    const polygon = req.data;
    const polygonPointsString = polygon.points.map(point => `${ point.lat } ${ point.long }`).join(',');
    const polygonString = `NEW ST_Point(LATITUDE, LONGITUDE).ST_Within(NEW ST_Polygon('Polygon((${ polygonPointsString }))'))`;
    const body = {};
    let resultSales;
    let query;
    try {
      query = 'select SUM(GROSSAMOUNT) AS AMOUNT,' + polygonString + ' AS COND from "SAP_HANA_DEMOCONTENT_EPM_SPATIAL_MODELS_REGION_SALES_BP" group by ' + polygonString;
      resultSales = await cds.run(query);
    }
    catch (e) {
      return req.error(
        500,
        `Error in in gross amount: ${ e.message }`
      );
    }
    resultSales.forEach(item => {
      if (item.COND === 1)
        body.totalSales = item.AMOUNT;
    });
    body.topBuyers = [];
    let resultBuyers;
    try {
      query = 'select PARTNERID,COMPANYNAME,LEGALFORM,LATITUDE,LONGITUDE,SUM(GROSSAMOUNT) AS AMOUNT,' + polygonString + ' AS COND from "SAP_HANA_DEMOCONTENT_EPM_SPATIAL_MODELS_REGION_SALES_BP" group by PARTNERID,COMPANYNAME,LEGALFORM,LATITUDE,LONGITUDE,' + polygonString + ' order by SUM(GROSSAMOUNT) desc';
      resultBuyers = await cds.run(query);
    }
    catch (e) {
      return req.error(
        500,
        `Error in in polygon: ${ e.message }`
      );
    }
    resultBuyers.some(item => {
      if (item.COND === 1) {
        body.topBuyers.push({
          partnerID: item.PARTNERID,
          companyName: item.COMPANYNAME,
          legalForm: item.LEGALFORM,
          totalSales: item.AMOUNT,
          lat: item.LATITUDE,
          long: item.LONGITUDE
        });
        return body.topBuyers.length === 5;
      }
    });
    let resultYoY;
    try {
      query = 'select YEAR_OF_SALE,SUM(GROSSAMOUNT) AS AMOUNT,' + polygonString + ' AS COND from "SAP_HANA_DEMOCONTENT_EPM_SPATIAL_MODELS_REGION_SALES_BP" group by YEAR_OF_SALE,' + polygonString + ' order by YEAR_OF_SALE';
      resultYoY = await cds.run(query);
    }
    catch (e) {
      return req.error(
        500,
        `Error in in year of sale: ${ e.message }`
      );
    }
    body.salesYoY = [];
    resultYoY.forEach(item => {
      if (item.COND === 1) {
        body.salesYoY.push({
          year: item.YEAR_OF_SALE,
          salesAmount: item.AMOUNT
        });
      }
    });
    return body;
  }
  catch (e) {
    return req.error(
      500,
      `Internal server error during sales analysis: ${ e.message }`
    )
  }
}

module.exports = { getSalesAnalysis };

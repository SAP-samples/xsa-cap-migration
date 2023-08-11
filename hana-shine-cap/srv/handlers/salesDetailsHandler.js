'use strict';

const cds = require('@sap/cds');

/**
 * An asynchronous function to create sales details.
 *
 * @async
 * @function createSalesDetail
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @returns {Promise} - Returns a promise that resolves into the request data upon successful creation and rejects with a message on error.
 */


async function createSalesDetail(req) {
  try {
    const values = [
      [
        {
          PRODUCT_PRODUCTID: req.data.PRODUCT_PRODUCTID,
          CURRENCY: req.data.CURRENCY,
          QUANTITY: req.data.QUANTITY,
          DELIVERYDATE: req.data.DELIVERYDATE
        }
      ],
      [],
    ];
    const sp = 'CALL "SOCREATE"(?, ?)';
    await cds.run(sp, values);
    return req.data;
  }
  catch (e) {
    return req.error(
      500,
      `Error in createSalesDetail: ${ e.message }`
    )
  }
}

module.exports = { createSalesDetail };

'use strict';
const cds = require('@sap/cds');

/**
 * An asynchronous function that retrieves the maximum ID + 1 from a database table of choice.
 * The choice is determined by the passed argument `idType`, which can either be `SalesOrderId` or `PurchaseOrderId`.
 * @async
 * @function getMaxId
 * @param {string} idType - Type of the ID. It accepts either `SalesOrderId` or `PurchaseOrderId`.
 * @returns {number} represents the next available ID. -1 in case of errors.
 */

async function getMaxId(idType) {
  let query;
  switch (idType) {
    case 'SalesOrderId':
      query = 'SELECT MAX(SALESORDERID + 1) as SALESORDERID FROM "SO_HEADER"';
      break;
    case 'PurchaseOrderId':
      query = 'SELECT MAX(PURCHASEORDERID + 1) as PURCHASEORDERID FROM "PO_HEADER"';
      break;
  }
  try {
    const maxID = await cds.run(query);
    let rs;
    if (idType === 'PurchaseOrderId')
      rs = maxID[0].PURCHASEORDERID;
    else if (idType === 'SalesOrderId')
      rs = maxID[0].SALESORDERID;

    return rs;
  }
  catch (e) {
    return -1;
  }
}

module.exports = { getMaxId };

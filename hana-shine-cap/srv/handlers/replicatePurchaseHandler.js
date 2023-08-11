'use strict';

const cds = require('@sap/cds');

/**
 * An asynchronous function to replicate a purchase order.
 * @async
 * @function replicatePurchase
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @returns {Promise<string>} - Returns a promise that resolves to a string with a success message in case of successful replication, and rejects with an error otherwise.
 */

async function replicatePurchase(req) {
  try {
    const recordquery = 'SELECT "RECORD_COUNT","TABLE_SIZE" FROM "SYS"."M_TABLES" where "TABLE_NAME"=\'PO_HEADER\'';
    const record = await cds.run(recordquery);
    if (record)
      record[0]['TABLE_SYNONYM'] = 'PO_HEADER';
    const tableSize = record[0].RECORD_COUNT;
    const headerQuery = `INSERT INTO "PO_HEADER" SELECT ("PURCHASEORDERID" + ${ tableSize }) AS "PURCHASEORDERID", "HISTORY_CREATEDBY_EMPLOYEEID", "HISTORY_CREATEDAT", "HISTORY_CHANGEDBY_EMPLOYEEID", "HISTORY_CHANGEDAT", "NOTEID", "PARTNER_PARTNERID", "CURRENCY", "GROSSAMOUNT", "NETAMOUNT", "TAXAMOUNT", "LIFECYCLESTATUS", "APPROVALSTATUS", "CONFIRMSTATUS", "ORDERINGSTATUS", "INVOICINGSTATUS" FROM "SHADOW_POSHADOW_HEADER"`;
    const headerResponse = await cds.run(headerQuery);
    const purchaseOrdersAdded = headerResponse;
    const itemQuery = `INSERT INTO "PO_ITEM" SELECT ("PURCHASEORDERID" + ${ tableSize }) AS "PURCHASEORDERID", "PURCHASEORDERITEM", "PRODUCT_PRODUCTID", "NOTEID", "CURRENCY", "GROSSAMOUNT", "NETAMOUNT", "TAXAMOUNT", "QUANTITY", "QUANTITYUNIT", "DELIVERYDATE" FROM "SHADOW_POSHADOW_ITEM"`;
    await cds.run(itemQuery);
    return `Purchase orders replicated successfully, records added: ${ purchaseOrdersAdded }`;
  }
  catch (e) {
    return req.error(
      500,
      `Error during purchase replication: ${ e.message }`
    );
  }
}

module.exports = { replicatePurchase };

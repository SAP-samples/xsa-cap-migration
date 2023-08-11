'use strict';

const cds = require('@sap/cds');

/**
 * An asynchronous function to replicate sales data.
 * @async
 * @function replicateSales
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @returns {Promise<string>} - Returns a promise that resolves to a string with a success message in case of successful replication, and rejects with an error otherwise.
 */

async function replicateSales(req) {
  try {
    const recordquery = 'SELECT "RECORD_COUNT","TABLE_SIZE" FROM "SYS"."M_TABLES" where "TABLE_NAME"=\'SO_HEADER\'';
    const record = await cds.run(recordquery);
    if (record)
      record[0]['TABLE_SYNONYM'] = 'SO_HEADER';
    const tableSize = record[0].RECORD_COUNT;
    const headerQuery = `INSERT INTO "SO_HEADER" SELECT TOP 1000 ("SALESORDERID" + ${ tableSize }) AS "SALESORDERID", "HISTORY_CREATEDBY_EMPLOYEEID", "HISTORY_CREATEDAT", "HISTORY_CHANGEDBY_EMPLOYEEID", "HISTORY_CHANGEDAT", "NOTEID", "PARTNER_PARTNERID", "CURRENCY", "GROSSAMOUNT", "NETAMOUNT", "TAXAMOUNT", "LIFECYCLESTATUS", "BILLINGSTATUS", "DELIVERYSTATUS" FROM "SHADOW_SOSHADOW_HEADER"`;
    const headerResponse = await cds.run(headerQuery);
    const salesOrdersAdded = headerResponse;
    const itemQuery = `INSERT INTO "SO_ITEM" SELECT ("SALESORDERID" + ${ tableSize }) AS "SALESORDERID", "SALESORDERITEM", "PRODUCT_PRODUCTID", "NOTEID", "CURRENCY", "GROSSAMOUNT", "NETAMOUNT", "TAXAMOUNT", "ITEMATPSTATUS", "OPITEMPOS", "QUANTITY", "QUANTITYUNIT", "DELIVERYDATE" FROM "SHADOW_SOSHADOW_ITEM" WHERE "SALESORDERID" < 500001000`;
    await cds.run(itemQuery);
    return `Sales orders replicated successfully, records added: ${ salesOrdersAdded }`;
  }
  catch (e) {
    return req.error(
      500,
      `Error during sales replication: ${ e.message }`
    );
  }
}

module.exports = { replicateSales };

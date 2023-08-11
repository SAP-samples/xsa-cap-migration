'use strict';
/**
 * An asynchronous function that generates a CSV-formatted string of selected purchase order data.
 * @async
 * @function downloadExcel
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @param {Object} PurchaseOrderHeader - CAP entity representing the PurchaseOrderHeader.
 * @returns {Promise<string>} - Promise that resolves to a CSV-formatted string, or rejects with 500 error code and message if data fetching or CSV generation fails.
 */

async function downloadExcel(req, PurchaseOrderHeader) {
  try {
    let body = '';
    const poList = await SELECT.from(PurchaseOrderHeader).columns('PURCHASEORDERID', 'PARTNERID', 'COMPANYNAME', 'CREATEDBYLOGINNAME', 'CREATEDAT', 'GROSSAMOUNT').limit(25000).orderBy('PURCHASEORDERID');
    body = 'Purchase Order ID' + ',' + 'Partner ID' + ',' + 'Company Name' + ',' + 'Employee Responsible' + ',' + 'Created At' + ',' + 'Gross Amount' + '\n';
    for (let i = 0; i < poList.length; i++)
      body += poList[i].PURCHASEORDERID + ',' + poList[i].PARTNERID + ',' + poList[i].COMPANYNAME + ',' + poList[i].CREATEDBYLOGINNAME + ',' + poList[i].CREATEDAT + ',' + poList[i].GROSSAMOUNT + '\n';
    return body;
  }
  catch (e) {
    return req.error(
      500,
      `Excel download Failed: ${ e.message }`
    );
  }
}

module.exports = { downloadExcel };

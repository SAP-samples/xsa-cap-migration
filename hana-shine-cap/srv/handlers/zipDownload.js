'use strict';

const JSZip = require('jszip');
const ExcelJS = require('exceljs');

/**
 * This function is responsible for returning a string representation of purchase order details.
 * @async
 * @function downloadZip
 * @param {Object} req - The request object carrying all details of the incoming HTTP request.
 * @param {Object} PurchaseOrderHeader - The Purchase Order Header data.
 * @returns {Promise} - A promise that resolves with a nodejs readable stream which is the zipped file containing the purchase order details and rejects with a message in case of error.
 */


async function downloadZip(req, PurchaseOrderHeader) {
  try {
    const results = await SELECT.from(PurchaseOrderHeader).columns('PURCHASEORDERID', 'PARTNERID', 'COMPANYNAME', 'CREATEDBYLOGINNAME', 'CREATEDAT', 'GROSSAMOUNT').limit(25000).orderBy('PURCHASEORDERID');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');
    worksheet.columns = [
      { header: 'Purchase Order ID', key: 'PURCHASEORDERID', width: 10 },
      { header: 'Partner ID', key: 'PARTNERID', width: 10 },
      { header: 'Company Name', key: 'COMPANYNAME', width: 10 },
      { header: 'Employee Responsible', key: 'CREATEDBYLOGINNAME', width: 10 },
      { header: 'Created At', key: 'CREATEDAT', width: 10 },
      { header: 'Gross Amount', key: 'GROSSAMOUNT', width: 10 }
    ];
    results.forEach(order => worksheet.addRow(order));
    const buffer = await workbook.xlsx.writeBuffer();
    const zip = new JSZip();
    zip.file('Excel.xlsx', buffer);
    const zippedFile = await zip.generateAsync({ type: 'nodebuffer' });
    return zippedFile;
  }
  catch (e) {
    return req.error(
      500,
      `Zip download Failed: ${ e.message }`
    )
  }
}

module.exports = { downloadZip };

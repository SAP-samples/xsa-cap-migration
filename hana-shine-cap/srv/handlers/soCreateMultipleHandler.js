'use strict';

const cds = require('@sap/cds');

/**
 * An asynchronous function for creating multiple sales orders with corresponding details.
 * @async
 * @function soCreateMultiple
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @param {Object} so_details - The sales order header object.
 * @param {Object} BusinessPartners - The Business Partners object.
 * @param {Object} Products - The Products object.
 * @param {Object} salesDetails - The sales order items object.
 * @returns {Promise} - A promise that resolves with a string containing the response body or rejects with a message in case of error.
 */

async function soCreateMultiple(req, so_details, BusinessPartners, Products, salesDetails) {
  try {
    const overallsoData = req.data;
    let responseBody = '';
    let lv_productid;
    let lv_price;
    let lv_quantity;
    let lv_netamount;
    let lv_taxamount;
    let lv_grossamount;
    let item_id = 10;
    let lv_so_netamount = 0;
    let lv_so_grossamount = 0;
    let lv_so_taxamount = 0;
    let i = 0;
    let lv_tax = 0;
    let finalItemId;
    const date = new Date().toISOString().slice(0, 10);
    responseBody += 'BP_ID:' + overallsoData.PARTNERID + '\n';
    const sid = await SELECT.from(so_details, [ 'Max(SALESORDERID + 1) as SALESORDERID' ]);
    let overAllId = '';
    let length = sid.length;
    while (length > 0) {
      overAllId = sid[0].SALESORDERID;
      responseBody += 'so id ' + parseFloat(overAllId).toFixed(0) + '\n';
      length--;
    }
    const lv_bp_id = overallsoData.PARTNERID;
    const comp = await SELECT.one(BusinessPartners).columns('COMPANYNAME').where({ PARTNERID: lv_bp_id });
    const lv_company = comp.COMPANYNAME;
    responseBody += 'lv_company ' + lv_company + '\n';
    const so_items = overallsoData.SalesOrderItems;
    if (so_items) {
      for (i; i < so_items.length; i++) {
        responseBody += 'item' + i + ' ' + 'Product_Id:' + so_items[i].Product_Id;
        responseBody += 'item' + i + ' ' + 'Quantity:' + so_items[i].Quantity;
        lv_productid = so_items[i].Product_Id;
        lv_quantity = so_items[i].Quantity;
        const pri = await SELECT.from(Products).columns('PRICE').where({ PRODUCTID: lv_productid });
        lv_price = pri[0].PRICE;
        responseBody += 'lv_price ' + lv_price + '\n';
        const TAXDATA = await cds.run('SELECT * FROM TAX_CALCULATION()');
        const TAXEntry = TAXDATA.filter(tax => tax.PARTNERID === lv_bp_id && tax.COMPANYNAME === lv_company && tax.PRODUCTID === lv_productid);
        if (TAXEntry.length > 0) {
          lv_tax = TAXEntry[0].TAX;
          responseBody += 'lv_tax ' + lv_tax + '\n';
        }
        lv_netamount = lv_price * lv_quantity;
        lv_taxamount = lv_netamount * lv_tax;
        lv_grossamount = lv_netamount + lv_taxamount;
        finalItemId = '';
        if (item_id >= 100)
          finalItemId = '0000000' + item_id;
        else
          finalItemId = '00000000' + item_id;

        const SItem = {
          SALESORDERID: parseFloat(overAllId).toFixed(0),
          SALESORDERITEM: finalItemId,
          PRODUCT_PRODUCTID: lv_productid,
          NOTEID: '',
          CURRENCY: 'EUR',
          GROSSAMOUNT: lv_grossamount,
          NETAMOUNT: lv_netamount,
          TAXAMOUNT: lv_taxamount,
          ITEMATPSTATUS: 'I',
          OPITEMPOS: '',
          QUANTITY: lv_quantity,
          QUANTITYUNIT: 'EA',
          DELIVERYDATE: date
        }
        await INSERT.into(salesDetails).entries(SItem);
        item_id = item_id + 10;
        lv_so_netamount = lv_so_netamount + lv_netamount;
        lv_so_grossamount = lv_so_grossamount + lv_grossamount;
        lv_so_taxamount = lv_so_taxamount + lv_taxamount;
      }
    }
    const soheader = {
      SALESORDERID: parseFloat(overAllId).toFixed(0),
      HISTORY_CREATEDBY_EMPLOYEEID: '0000000033',
      HISTORY_CREATEDAT: date,
      HISTORY_CHANGEDBY_EMPLOYEEID: '0000000033',
      HISTORY_CHANGEDAT: date,
      NOTEID: '',
      PARTNER_PARTNERID: overallsoData.PARTNERID,
      CURRENCY: 'EUR',
      GROSSAMOUNT: lv_so_grossamount,
      NETAMOUNT: lv_so_netamount,
      TAXAMOUNT: lv_so_taxamount,
      LIFECYCLESTATUS: 'N',
      BILLINGSTATUS: 'I',
      DELIVERYSTATUS: 'I'
    }
    await INSERT.into(so_details).entries(soheader);
    return responseBody;
  }
  catch (e) {
    return req.error(
      500,
      `Error in Multiple Sales order creation: ${ e.message }`
    )
  }
}

module.exports = { soCreateMultiple };

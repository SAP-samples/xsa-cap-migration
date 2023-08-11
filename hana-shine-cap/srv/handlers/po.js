'use strict';

/**
 * An asynchronous function to create a purchase order.
 * @async
 * @function poCreate
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @param {Object} PO_POHEADER - The purchase order header object.
 * @param {Object} Products - The product object.
 * @param {Object} PO_ITEM - The purchase order items object.
 * @returns {Promise} - Returns an object representing a purchase order ID in case of successful creation; otherwise, rejects with an error.
 */

async function poCreate(req, PO_POHEADER, Products, PO_ITEM) {
  try {
    const pid = await SELECT.from(PO_POHEADER, [ 'Max(PURCHASEORDERID + 1) as mid' ]);
    const poid = pid[0].mid;
    const currency = 'EUR';
    const pri = await SELECT.from(Products).columns('PRICE').where({ PRODUCTID: req.data.PRODUCTID });
    const price = pri[0].PRICE;
    const netamount = price * req.data.QUANTITY;
    const taxamount = netamount * 0.19;
    const grossamount = netamount + taxamount;
    const date = new Date().toISOString().slice(0, 10);
    const poheader = {
      PURCHASEORDERID: parseFloat(poid).toFixed(0),
      HISTORY_CREATEDBY_EMPLOYEEID: '33',
      HISTORY_CREATEDAT: date,
      HISTORY_CHANGEDBY_EMPLOYEEID: '33',
      HISTORY_CHANGEDAT: date,
      NOTEID: '',
      PARTNER_PARTNERID: req.data.PARTNERID,
      CURRENCY: currency,
      GROSSAMOUNT: grossamount,
      NETAMOUNT: netamount,
      TAXAMOUNT: taxamount,
      LIFECYCLESTATUS: 'N',
      APPROVALSTATUS: 'I',
      CONFIRMSTATUS: 'I',
      ORDERINGSTATUS: 'I',
      INVOICINGSTATUS: 'I'
    }
    await INSERT.into(PO_POHEADER).entries(poheader);
    const poitem = {
      PURCHASEORDERID: parseFloat(poid).toFixed(0),
      PURCHASEORDERITEM: '0000000010',
      PRODUCT_PRODUCTID: req.data.PRODUCTID,
      NOTEID: '',
      CURRENCY: currency,
      GROSSAMOUNT: grossamount,
      NETAMOUNT: netamount,
      TAXAMOUNT: taxamount,
      QUANTITY: req.data.QUANTITY,
      QUANTITYUNIT: 'EA',
      DELIVERYDATE: date
    }
    await INSERT.into(PO_ITEM).entries(poitem);
    return {
      PURCHASEORDERID: parseFloat(poid).toFixed(0),
    }
  }
  catch (e) {
    return req.error(
      500,
      `Error during purchase order creation: ${ e.message }`
    );
  }
}
module.exports = { poCreate };

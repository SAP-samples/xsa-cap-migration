'use strict';
const getMaxId = require('./getMaxIdHandler').getMaxId;

/**
 * Asynchronous function that creates time based Purchase Order or Sales Order data and persist them into the database randomly.
 * @async
 * @function createTimeBasedPO
 * @param {Array} startDates - An array of start dates.
 * @param {number} totalSize - The total size of orders.
 * @param {Object} bpDict - A dictionary object containing business partner info.
 * @param {Object} prodDict - A dictionary object containing product info.
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @param {string} id - The identifier to decide the type of order ('PurchaseOrderId' or 'SalesOrderId').
 * @param {Object} srv - The CAP service Object.
 * @returns {Promise<string>} A promise that resolves to a string 'Success' indicating operation success or rejects with an HTTP error response.
 * @throws {Error} Will throw an error if 'getMaxId' function returns -1 or undefined and when database transaction errors occur.
 */

async function createTimeBasedPO(startDates, totalSize, bpDict, prodDict, req, id, srv) {
  const { PO_POHEADER, PO_ITEM, so_details, salesDetails } = srv.entities;
  try {
    const maxId = await getMaxId(id);
    if (maxId === -1 || maxId === undefined)
      throw new Error(`Error in getMaxId: Invalid ID (${ maxId }) returned for '${ id }'`);
    let maxPoId = maxId;
    const headers = [];
    const items = [];
    const itemCounts = Array.from({ length: totalSize }, () => Math.floor((Math.random() * 4) + 1));
    for (let index = 0; index < itemCounts.length; index++) {
      const count = itemCounts[index];
      const productIDs = new Set();
      maxPoId = parseInt(maxPoId, 10) + 1;
      maxPoId = maxPoId.toString();
      let randNetAmount = 0;
      let randTaxAmount = 0;
      let randGrossAmount = 0;
      const StartDateStr = startDates[index];
      for (let itemCount = 0; itemCount < count; itemCount++) {
        let randProductIndex;
        do
          randProductIndex = Math.floor(Math.random() * 105);
        while (productIDs.has(randProductIndex));

        productIDs.add(randProductIndex);
        const randProduct = prodDict[randProductIndex][0];
        const randPrice = prodDict[randProductIndex][1];
        const randQuantity = Math.floor((Math.random() * 9) + 1);
        const netAmountItem = parseInt((randQuantity * randPrice).toFixed(2), 10);
        const taxAmountItem = parseInt((netAmountItem * 0.19).toFixed(2), 10);
        const grossAmountItem = netAmountItem + taxAmountItem;
        randNetAmount += netAmountItem;
        randTaxAmount += taxAmountItem;
        randGrossAmount += grossAmountItem;
        const itemData = {
          PRODUCT_PRODUCTID: randProduct,
          NOTEID: 'NoteId',
          CURRENCY: 'EUR',
          GROSSAMOUNT: grossAmountItem,
          NETAMOUNT: netAmountItem,
          TAXAMOUNT: taxAmountItem,
          QUANTITY: randQuantity,
          QUANTITYUNIT: 'EA',
          DELIVERYDATE: StartDateStr
        };

        if (id === 'SalesOrderId') {
          itemData.SALESORDERID = maxPoId;
          itemData.SALESORDERITEM = '00000000' + ((itemCount + 1) * 10);
          itemData.ITEMATPSTATUS = 'I';
          itemData.OPITEMPOS = 'test';
        }
        else if (id === 'PurchaseOrderId') {
          itemData.PURCHASEORDERID = maxPoId;
          itemData.PURCHASEORDERITEM = '00000000' + ((itemCount + 1) * 10);
        }
        items.push(itemData);
      }
      const randBPIndex = Math.floor(Math.random() * 44);
      const randBP = bpDict[randBPIndex];
      const headerData = {
        HISTORY_CREATEDBY_EMPLOYEEID: '0000000033',
        HISTORY_CREATEDAT: StartDateStr,
        HISTORY_CHANGEDBY_EMPLOYEEID: '0000000033',
        HISTORY_CHANGEDAT: StartDateStr,
        NOTEID: 'NoteId',
        PARTNER_PARTNERID: randBP,
        CURRENCY: 'EUR',
        GROSSAMOUNT: randGrossAmount,
        NETAMOUNT: randNetAmount,
        TAXAMOUNT: randTaxAmount,
        LIFECYCLESTATUS: 'N'
      }
      if (id === 'PurchaseOrderId') {
        headerData.APPROVALSTATUS = 'I';
        headerData.CONFIRMSTATUS = 'I';
        headerData.PURCHASEORDERID = maxPoId;
        headerData.ORDERINGSTATUS = 'I';
        headerData.INVOICINGSTATUS = 'I';
      }
      else if (id === 'SalesOrderId') {
        headerData.SALESORDERID = maxPoId;
        headerData.BILLINGSTATUS = 'I';
        headerData.DELIVERYSTATUS = 'I';
      }
      headers.push(headerData);
    }
    if (id === 'PurchaseOrderId') {
      await INSERT.into(PO_POHEADER).entries(headers);
      await INSERT.into(PO_ITEM).entries(items);
    }
    else if (id === 'SalesOrderId') {
      await INSERT.into(so_details).entries(headers);
      await INSERT.into(salesDetails).entries(items);
    }
    return 'Success'
  }
  catch (e) {
    return req.error(
      500,
      `Error in createTimeBasedPO: ${ e.message }`
    )
  }
}

module.exports = { createTimeBasedPO };

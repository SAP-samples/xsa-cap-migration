'use strict';
const cds = require('@sap/cds');
const createFilterEntry = require('./createFilterEntry').createFilterEntry;

/**
 * Performs a complex search operation based on a search query input. The search covers company names, city names, product categories, product IDs, and purchase order IDs.
 * @async
 * @function getFilter
 * @param {Object} req - The request object carrying all details in the incoming request.
 * @param {Object} BusinessPartners - Represents the Business Partners entity type.
 * @param {Object} Products - Represents the Products entity type.
 * @param {Object} PO_POHEADER - Represents the Purchase Order entity type.
 * @returns {Promise<string>} A promise that resolves to a JSON string containing search results or rejects with a message in case of error.
*/


async function getFilter(req, BusinessPartners, Products, PO_POHEADER) {
  const terms = req.data.query;
  const termList = terms.split(' ');
  let termStr = '';
  const maxLimit = 50;
  // Here we parse the search query into individual term, concatenate each term with an asterisk '*', and then combine them into a single string.
  termList.slice(0, maxLimit).forEach(term => {
    termStr += term.replace(/\s+/g, '') + '* ';
  });
  try {
    const list = [];
    const str = termStr.split('*');
    const isNumbericString = str[0];
    if (isNaN(isNumbericString)) {
      try {
        const COMP = await SELECT.distinct.from(BusinessPartners).columns('COMPANYNAME').where([ {
          func: 'contains',
          args: [
            { ref: [ 'COMPANYNAME' ] },
            { val: req.data.query }
          ]
        } ]).limit(50);
        COMP.forEach(item => {
          list.push(createFilterEntry(item.COMPANYNAME, 'Company Name', 'businessPartner'));
        });
      }
      catch (err) {
        return req.error(
          500,
          'Exception raised from company name search. Check logs for details'
        )
      }
      try {
        const CITY = await cds.run(`SELECT CITY FROM GET_BUYER_CITY('${ req.data.query }')`);
        CITY.forEach(item => {
          list.push(createFilterEntry(item.CITY, 'City', 'businessPartner'));
        });
      }
      catch (err) {
        return req.error(
          500,
          'Exception raised from city search. Check logs for details'
        )
      }
      try {
        const CATEGORY = await SELECT.distinct.from(Products).columns('CATEGORY').where([ {
          func: 'contains',
          args: [
            { ref: [ 'CATEGORY' ] },
            { val: req.data.query }
          ]
        } ]).limit(50);
        CATEGORY.forEach(item => {
          list.push(createFilterEntry(item.CATEGORY, 'Category', 'products'));
        });
      }
      catch (err) {
        return req.error(
          500,
          'Exception raised from product category search. Check logs for details'
        )
      }
      try {
        const POID = await SELECT.distinct.from(Products).columns('PRODUCTID').where([ {
          func: 'contains',
          args: [
            { ref: [ 'PRODUCTID' ] },
            { val: req.data.query }
          ]
        } ]).limit(50);
        POID.forEach(item => {
          list.push(createFilterEntry(item.PRODUCTID, 'Product ID', 'products'));
        });
      }
      catch (err) {
        return req.error(
          500,
          'Exception raised from productId search. Check logs for details'
        )
      }
    }
    else {
      try {
        const PO_POID = await SELECT.distinct.from(PO_POHEADER).columns('PURCHASEORDERID').where([ {
          func: 'contains',
          args: [
            { ref: [ 'PURCHASEORDERID' ] },
            { val: req.data.query }
          ]
        } ]).limit(50);
        PO_POID.forEach(item => {
          list.push(createFilterEntry(item.PURCHASEORDERID, 'Purchase Order ID', 'purchaseOrder'));
        });
      }
      catch (err) {
        return req.error(
          500,
          'Exception raised from purchaseorder id search. Check logs for details'
        )
      }
    }
    return JSON.stringify(list);
  }
  catch (error) {
    return req.error(
      500,
      `Search failed due to an internal server error: ${ error.message }`
    )
  }
}

module.exports = { getFilter };

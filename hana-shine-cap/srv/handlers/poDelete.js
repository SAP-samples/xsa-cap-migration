'use strict';

/**
 * An asynchronous function to delete a purchase order
 * @async
 * @function poDelete
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @param {Object} PO_POHEADER - The purchase order header object.
 * @returns {Promise} - Returns an info object with status and message in case of successful deletion; otherwise, rejects with an error.
 */


async function poDelete(req, PO_POHEADER) {
  try {
    const statusColumns = await SELECT.from(PO_POHEADER).columns('LIFECYCLESTATUS', 'APPROVALSTATUS', 'CONFIRMSTATUS', 'ORDERINGSTATUS', 'INVOICINGSTATUS').where({ PURCHASEORDERID: req.data.PURCHASEORDERID });
    if (statusColumns === 'null')
      return req.error(400, 'Invalid Purchase order number provided')

    const { LIFECYCLESTATUS, CONFIRMSTATUS, APPROVALSTATUS, ORDERINGSTATUS, INVOICINGSTATUS } = statusColumns[0];

    if (LIFECYCLESTATUS === 'C') {
      return req.error(
        500,
        'Closed purchase orders can not be deleted'
      )
    }
    if (LIFECYCLESTATUS === 'X') {
      return req.error(
        500,
        'Purchase Order &1 has already been deleted'
      )
    }
    if (APPROVALSTATUS === 'A') {
      return req.error(
        500,
        'Approved Purchase Orders can not be deleted'
      )
    }
    if (CONFIRMSTATUS === 'C') {
      return req.error(
        500,
        'Confirmed Purchase Orders can not be deleted'
      )
    }
    if (CONFIRMSTATUS === 'S') {
      return req.error(
        500,
        'Confirmed Purchase Orders which have been sent to the partner can not be deleted'
      )
    }
    if (ORDERINGSTATUS === 'D') {
      return req.error(
        500,
        'Delivered Purchase Orders can not be deleted'
      )
    }
    if (INVOICINGSTATUS === 'D') {
      return req.error(
        500,
        'Invoiced Purchase Orders can not be deleted'
      )
    }
    await UPDATE(PO_POHEADER).set({ LIFECYCLESTATUS: 'X' }).where({ PURCHASEORDERID: req.data.PURCHASEORDERID });
    return req.info(200, 'Purchase Order Deleted Successfully')
  }
  catch (error) {
    return req.error(
      500,
      `Lifecycle Update Failed: ${ error.message }`
    );
  }
}
module.exports = { poDelete };

'use strict';

/**
 * An asynchronous function to approve a purchase order.
 * @async
 * @function poApprove
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @param {Object} PO_POHEADER - The purchase order header object.
 * @returns {Promise} - Returns an info object with status and message in case of successful approval; otherwise, rejects with an error.
 */


async function poApprove(req, PO_POHEADER) {
  try {
    const statusColumns = await SELECT.from(PO_POHEADER).columns('LIFECYCLESTATUS', 'APPROVALSTATUS', 'CONFIRMSTATUS', 'ORDERINGSTATUS', 'INVOICINGSTATUS').where({ PURCHASEORDERID: req.data.PURCHASEORDERID });
    if (statusColumns === 'null') {
      return req.error(
        400,
        'Invalid Purchase order number provided'
      )
    }
    const { LIFECYCLESTATUS, CONFIRMSTATUS, ORDERINGSTATUS, INVOICINGSTATUS } = statusColumns[0];
    if (LIFECYCLESTATUS === 'C') {
      return req.error(
        500,
        'Closed purchase orders can not be accepted or rejected'
      )
    }
    if (LIFECYCLESTATUS === 'X') {
      return req.error(
        500,
        'Deleted purchase orders can not be accepted or rejected'
      )
    }
    if (CONFIRMSTATUS === 'C') {
      return req.error(
        500,
        'Confirmed Purchase Orders can not be accepted or rejected'
      )
    }
    if (CONFIRMSTATUS === 'S') {
      return req.error(
        500,
        'Confirmed Purchase Orders which have been sent to the partner can not be accepted or rejected'
      )
    }
    if (ORDERINGSTATUS === 'D') {
      return req.error(
        500,
        'Delivered Purchase Orders can not be accepted or rejected'
      )
    }
    if (INVOICINGSTATUS === 'D') {
      return req.error(
        500,
        'Invoiced Purchase Orders can not be accepted or rejected'
      )
    }
    if (req.data.Action === 'Reject') {
      await UPDATE(PO_POHEADER).set({ APPROVALSTATUS: 'R' }).where({ PURCHASEORDERID: req.data.PURCHASEORDERID });
      return req.info(200, 'Purchase Order Rejected');
    }
    else if (req.data.Action === 'Accept') {
      await UPDATE(PO_POHEADER).set({ APPROVALSTATUS: 'A' }).where({ PURCHASEORDERID: req.data.PURCHASEORDERID });
      return req.info(200, 'Purchase Order Approved');
    }
  }
  catch (error) {
    return req.error(
      500,
      `Update of approval status failed: ${ error.message }`
    );
  }
}
module.exports = { poApprove };

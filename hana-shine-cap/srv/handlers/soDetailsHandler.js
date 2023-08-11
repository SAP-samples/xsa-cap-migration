'use strict';

/**
 * This asynchronous function is responsible for deleting sales order details.
 * @async
 * @function deleteSoDetail
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @param {Object} so_details - The sales order header object.
 * @param {Object} salesDetails - The sales order items object.
 * @returns {Promise} - A promise that resolves when the operation has completed. If the operation fails, the promise rejects with an error message.
*/


async function deleteSoDetail(req, so_details, salesDetails) {
  try {
    const soID = await SELECT.from(so_details).columns('SALESORDERID').where({ SALESORDERID: req.data.SALESORDERID });
    if (soID === '') {
      return req.error(
        400,
        'Invalid Sales Order ID'
      )
    }
    else {
      await DELETE.from(salesDetails).where({ SALESORDERID: req.data.SALESORDERID });
      await DELETE.from(so_details).where({ SALESORDERID: req.data.SALESORDERID });
      return req.info(
        200,
        'Sales Order Deleted Successfully'
      )
    }
  }
  catch (e) {
    return req.error(
      500,
      `Sales Order Deletion Failed: ${ e.message }`
    )
  }
}

module.exports = { deleteSoDetail };

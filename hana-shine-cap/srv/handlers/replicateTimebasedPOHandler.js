'use strict';

const callCreateTimeBasedPo = require('./callCreateTimeBasedPo').callCreateTimeBasedPo;

/**
 * An asynchronous function to replicate Time-based Purchase Order data
 * @async
 * @function replicateTimebasedPO
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @param {Object} srv - The CAP service Object.
 * @returns {Promise} - Returns a string with a success message in case of successful replication; otherwise, rejects with an error.
 */

async function replicateTimebasedPO(req, srv) {
  const { BusinessPartners, Products } = srv.entities;
  const totalRecords = (req.data.noRec) * 1000;
  try {
    const thetaArray = [];
    const id = req.data.id;
    const businessPartners = await SELECT.from(BusinessPartners).columns('PARTNERID');
    const bpDict = businessPartners.map(bp => bp.PARTNERID);
    const products = await SELECT.from(Products).columns('PRODUCTID', 'PRICE');
    const prodDict = products.map(prod => [ prod.PRODUCTID, prod.PRICE ]);
    const StartDate = new Date(typeof req.data.startdate.replace === 'function' ? req.data.startdate.replace("'", '') : req.data.startdate);
    const endDate = new Date(typeof req.data.enddate.replace === 'function' ? req.data.enddate.replace("'", '') : req.data.enddate);
    const timeDiff = Math.abs(endDate.getTime() - StartDate.getTime());
    const diffDays = (Math.ceil(timeDiff / (1000 * 3600 * 24))) + 1;
    let aNoRec = encodeURI(req.data.noRec);
    aNoRec = parseInt(aNoRec, 10) * 1000;
    if (aNoRec === 0)
      return;
    let randNo = diffDays === 1 ? 1 : Math.random();
    let alpha = Math.round(aNoRec / diffDays);
    let calc;
    thetaArray[0] = Math.round(alpha * randNo);
    aNoRec = +(aNoRec - thetaArray[0]) || 0;
    for (let i = 1; i <= (diffDays - 1); i++) {
      randNo = Math.random();
      if ((diffDays - i) > 0) {
        alpha = Math.round(aNoRec / (diffDays - i));
        calc = Math.round(alpha * randNo) * Math.round(6 * randNo);
        thetaArray[i] = (calc <= aNoRec) ? calc : 0;
        aNoRec = +(aNoRec - thetaArray[i]) || 0;
      }
    }
    if (aNoRec > 0)
      thetaArray[diffDays - 1] = +aNoRec || 0;

    const totalSize = 0;
    const dates = [], batchSizes = [];
    const j = 0;
    const textStatus = await callCreateTimeBasedPo(j, diffDays, thetaArray, StartDate, totalSize, dates, batchSizes, prodDict, req, bpDict, id, srv);
    let text = '';
    if (textStatus) {
      if (id === 'PurchaseOrderId')
        text = 'Purchase Orders replicated successfully, records added: ' + totalRecords;
      else if (id === 'SalesOrderId')
        text = 'Sales Orders replicated successfully, records added: ' + totalRecords;
    }
    return text;
  }
  catch (e) {
    return req.error(
      500,
      `Error in replicateTimebasedPO ${ e.message }`
    )
  }
}

module.exports = { replicateTimebasedPO };

'use strict';
const createTimeBasedPO = require('./createTimeBasedPOHandler').createTimeBasedPO;

/**
 * This asynchronous function recursively creates time based purchase orders based on a predetermined schedule.
 * It goes through each day within a date range and decides whether a purchase order needs to be created based on thetaArray.
 * It then batches information to be later used for creating POs. The batchSize is reset when the totalSize reaches 1000 or when it reaches either the last day of the range or the 1000th day (whichever comes first).
 * @async
 * @function callCreateTimeBasedPo
 * @param {number} j - The current index of thetaArray serving as the operating day.
 * @param {number} diffDays - The number of days apart for each purchase order.
 * @param {Array<number>} thetaArray - An array where each element represents the number of purchase orders to be created on a specific day.
 * @param {Date} StartDate - The start date for the creation of the purchase orders.
 * @param {number} totalSize - A running total of the sizes of the created batches.
 * @param {Array<string>} dates - An array storing the dates for each batch.
 * @param {Array<number>} batchSizes - An array storing the size for each batch to be processed.
 * @param {Object} prodDict - An Object holding the product data; each entry maps a product id to its quantity.
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @param {Object} bpDict - An Object holding the business partner data, where each property is the id of a business partner.
 * @param {number|string} id - An identifier for the current user or current operation.
 * @param {Object} srv - The CAP service Object.
 * @returns {boolean} - A Promise that resolves to a boolean value indicating whether the operation was successful.
 */

async function callCreateTimeBasedPo(j, diffDays, thetaArray, StartDate, totalSize, dates, batchSizes, prodDict, req, bpDict, id, srv) {
  try {
    if (thetaArray[j] === 0) {
      j = j + 1;
      if (j <= (diffDays - 1))
        await callCreateTimeBasedPo(j, diffDays, thetaArray, StartDate, totalSize, dates, batchSizes, prodDict, req, bpDict, id, srv);
      else
        return true;

      return false;
    }
    let startDay = StartDate.getDate();
    let startMonth = StartDate.getMonth() + 1;
    const startYear = StartDate.getFullYear();
    if (startDay < 10)
      startDay = '0' + startDay;

    if (startMonth < 10)
      startMonth = '0' + startMonth;

    const StartDateStr = startYear.toString() + '-' + startMonth.toString() + '-' + startDay;
    const BATCHSIZE = thetaArray[j];
    totalSize += BATCHSIZE;
    dates.push(StartDateStr);
    batchSizes.push(BATCHSIZE);
    if (totalSize < 1000 || j === (diffDays - 1) && diffDays < 1000) {
      const msg = await createTimeBasedPO(dates, totalSize, bpDict, prodDict, req, id, srv);
      if (msg !== 'Success')
        return false;

      dates = [];
      batchSizes = [];
      totalSize = 0;
      if (j < (diffDays - 1)) {
        j = j + 1;
        await callCreateTimeBasedPo(j, diffDays, thetaArray, StartDate, totalSize, dates, batchSizes, prodDict, req, bpDict, id, srv);
      }
      else {
        return true;
      }
    }
    StartDate.setDate(StartDate.getDate() + 1);
    return true;
  }
  catch (e) {
    return req.error(
      500,
      `Error in callCreateTimeBasedPo: ${ e.message }`
    )
  }
}

module.exports = { callCreateTimeBasedPo };

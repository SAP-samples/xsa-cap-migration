'use strict';

/**
 * This handles routing and passing off to specific handlers for the CAP service.
 * Each handler function executes when srv emits the corresponding event linked to the handler.
 * @param {Object} srv - The CAP service, which will emit events that these handlers react to.
 * @param {Object} srv.entities - The entities which are fired and needed within the endpoint handlers
 */

const userVerifyHandler = require('./handlers/Usersverify');
const userCreateHandler = require('./handlers/Userscreate');
const poHandler = require('./handlers/po');
const deleteHandler = require('./handlers/poDelete');
const approveHandler = require('./handlers/poApprove');
const excelDownloadHandler = require('./handlers/excelDownload');
const zipDownloadHandler = require('./handlers/zipDownload');
const getFilterHandler = require('./handlers/getFilter');
const getTotalOrdersHandler = require('./handlers/getTotalOrders');
const sessionInfoHandler = require('./handlers/sessionInfoHandler');
const salesDetailsHandler = require('./handlers/salesDetailsHandler');
const soDetailsHandler = require('./handlers/soDetailsHandler');
const soCreateMultipleHandler = require('./handlers/soCreateMultipleHandler');
const addKeysHandler = require('./handlers/addKeysHandler');
const getKeysHandler = require('./handlers/getKeysHandler');
const getBPTransactionDataHandler = require('./handlers/getBPTransactionDataHandler');
const getAllBusinessPartnersDataHandler = require('./handlers/getAllBusinessPartnersData');
const getBPSalesDataHandler = require('./handlers/getBPSalesDataHandler');
const getSalesAnalysisHandler = require('./handlers/getSalesAnalysisHandler');
const getUserSessionInfoHandler = require('./handlers/getUserSessionInfoHandler');
const getDBTableSizeHandler = require('./handlers/getDBTableSizeHandler');
const replicateTimebasedPOHandler = require('./handlers/replicateTimebasedPOHandler');
const replicateSalesHandler = require('./handlers/replicateSalesHandler');
const replicatePurchaseHandler = require('./handlers/replicatePurchaseHandler');
const resetHandler = require('./handlers/resetHandler');
const jobsHandlers = require('./handlers/jobsHandlers');
const createJobScheduleHandler = require('./handlers/createJobScheduleHandler');
const deleteJobScheduleHandler = require('./handlers/deleteJobScheduleHandler');
const generateTimeDataHandler = require('./handlers/generateTimeDataHandler');
const checkTimeDataHandler = require('./handlers/checkTimeDataHandler');

module.exports = async (srv) => {

  const { JOBS_SCHEDULEDETAILS, MapKeys, PO_POHEADER, PO_ITEM, BusinessPartners, Products, PurchaseOrderHeader, so_details, salesDetails } = srv.entities;

  srv.on('CREATE', 'Users', async (req) => {
    return userCreateHandler.createUser(req);
  });
  srv.before('CREATE', 'Users', async (req) => {
    return userVerifyHandler.verifyEmail(req);
  });
  srv.on('poCreate', async (req) => {
    return poHandler.poCreate(req, PO_POHEADER, Products, PO_ITEM);
  });
  srv.on('poDelete', async (req) => {
    return deleteHandler.poDelete(req, PO_POHEADER);
  });
  srv.on('poApprove', async (req) => {
    return approveHandler.poApprove(req, PO_POHEADER);
  });
  srv.on('downloadExcel', async (req) => {
    return excelDownloadHandler.downloadExcel(req, PurchaseOrderHeader);
  });
  srv.on('downloadZip', async (req) => {
    return zipDownloadHandler.downloadZip(req, PurchaseOrderHeader);
  });
  srv.on('getFilter', async (req) => {
    return getFilterHandler.getFilter(req, BusinessPartners, Products, PO_POHEADER);
  });
  srv.on('getTotalOrders', async (req) => {
    return getTotalOrdersHandler.getTotalOrders(req);
  });
  srv.on('getSessionInfo', async (req) => {
    return sessionInfoHandler.getSessionInfo(req);
  });
  srv.on('CREATE', 'salesDetails', async (req) => {
    return salesDetailsHandler.createSalesDetail(req);
  });
  srv.on('DELETE', 'so_details', async (req) => {
    return soDetailsHandler.deleteSoDetail(req, so_details, salesDetails);
  });
  srv.on('soCreateMultiple', async (req) => {
    return soCreateMultipleHandler.soCreateMultiple(req, so_details, BusinessPartners, Products, salesDetails);
  });
  srv.on('addKeys', async (req) => {
    return addKeysHandler.addKeys(req, MapKeys);
  });
  srv.on('getKeys', async (req) => {
    return getKeysHandler.getKeys(req, MapKeys);
  });
  srv.on('getBPTransactionData', async (req) => {
    return getBPTransactionDataHandler.getBPTransactionData(req, srv);
  });
  srv.on('getAllBusinessPartnersData', async (req) => {
    return getAllBusinessPartnersDataHandler.getAllBusinessPartnersData(req, srv);
  });
  srv.on('getBPSalesData', async (req) => {
    return getBPSalesDataHandler.getBPSalesData(req, srv);
  });
  srv.on('getSalesAnalysis', async (req) => {
    return getSalesAnalysisHandler.getSalesAnalysis(req);
  });
  srv.on('getUserSessionInfo', async (req) => {
    return getUserSessionInfoHandler.getUserSessionInfo(req);
  });
  srv.on('getDBTableSize', async (req) => {
    return getDBTableSizeHandler.getDBTableSize(req);
  });
  srv.on('replicateTimebasedPO', async (req) => {
    return replicateTimebasedPOHandler.replicateTimebasedPO(req, srv);
  });
  srv.on('replicateSales', async (req) => {
    return replicateSalesHandler.replicateSales(req);
  });
  srv.on('replicatePurchase', async (req) => {
    return replicatePurchaseHandler.replicatePurchase(req);
  });
  srv.on('resetSOHeader', async (req) => {
    return resetHandler.resetSOHeader(req);
  });
  srv.on('resetSOItem', async (req) => {
    return resetHandler.resetSOItem(req);
  });
  srv.on('resetPOHeader', async (req) => {
    return resetHandler.resetPOHeader(req);
  });
  srv.on('resetPOItem', async (req) => {
    return resetHandler.resetPOItem(req);
  });
  srv.on('resetAddresses', async (req) => {
    return resetHandler.resetAddresses(req);
  });
  srv.on('resetEmployees', async (req) => {
    return resetHandler.resetEmployees(req);
  });
  srv.on('resetPartners', async (req) => {
    return resetHandler.resetPartners(req);
  });
  srv.on('resetProducts', async (req) => {
    return resetHandler.resetProducts(req);
  });
  srv.on('resetConstants', async (req) => {
    return resetHandler.resetConstants(req);
  });
  srv.on('resetTexts', async (req) => {
    return resetHandler.resetTexts(req);
  });
  srv.on('resetNotes', async (req) => {
    return resetHandler.resetNotes(req);
  });
  srv.on('resetAttachments', async (req) => {
    return resetHandler.resetAttachments(req);
  });
  srv.on('deletejobdata', async (req) => {
    return jobsHandlers.deleteJobData(req);
  });
  srv.on('jobCreate', async (req) => {
    return jobsHandlers.jobCreate(req, srv);
  });
  srv.on('createjobschedule', async (req) => {
    return createJobScheduleHandler.createJobSchedule(req, JOBS_SCHEDULEDETAILS);
  });
  srv.on('deletejobschedules', async (req) => {
    return deleteJobScheduleHandler.deleteJobSchedule(req, JOBS_SCHEDULEDETAILS);
  });
  srv.on('generateTimeData', async (req) => {
    return generateTimeDataHandler.generateTimeData(req);
  });
  srv.on('checkTimeData', async (req) => {
    return checkTimeDataHandler.checkTimeData(req);
  });
}

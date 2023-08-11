using from './service';

extend service ShineService {
    function downloadExcel() returns String;
    function downloadZip() returns String;
    function getFilter(query : String) returns String;
    function getTotalOrders(groupby : String, currency : String) returns String;
    function getSessionInfo() returns String;
    function getKeys() returns String;
    function getBPTransactionData(bpId : String(10), lat : Decimal, long : Decimal, userlat : Decimal, userlong : Decimal) returns String;
    function getAllBusinessPartnersData() returns String;
    function getBPSalesData(bpId : String(10)) returns String;
    function getUserSessionInfo() returns String;

    type dbtable : {
        RECORD_COUNT  : Integer;
        TABLE_SIZE    : String;
        TABLE_SYNONYM : String;
    }

    function getDBTableSize() returns array of dbtable;
    function replicateSales() returns String;
    function replicatePurchase() returns String;
    function resetSOHeader() returns String;
    function resetSOItem() returns String;
    function resetPOHeader() returns String;
    function resetPOItem() returns String;
    function resetAddresses() returns String;
    function resetEmployees() returns String;
    function resetPartners() returns String;
    function resetProducts() returns String;
    function resetConstants() returns String;
    function resetTexts() returns String;
    function resetNotes() returns String;
    function resetAttachments() returns String;
    function jobCreate(jobname : String) returns String;
    function deletejobdata() returns String;
    function deletejobschedules(jobId : String) returns String;
    function generateTimeData() returns String;
    function checkTimeData() returns String;
}

using from './service';

extend service ShineService {

    @(requires: 'create')
    action poCreate(PARTNERID : String, PRODUCTID : String, QUANTITY : Integer) returns String;

    @(requires: 'create')
    action poDelete(PURCHASEORDERID : String) returns String;

    @(requires: 'create')
    action poApprove(PURCHASEORDERID : String, Action : String) returns String;

    type salesitems : {
        Product_Id : String;
        Quantity   : String;
    }

    @(requires: 'create')
    action soCreateMultiple(PARTNERID : String, SalesOrderItems : array of salesitems) returns String;

    @(requires: 'create')
    action addKeys(API_KEY : String(100)) returns String;

    @(requires: 'create')
    action getSalesAnalysis(points : array of mappoints) returns String;

    type mappoints  : {
        lat  : Decimal;
        long : Decimal;
    }

    @(requires: 'create')
    action replicateTimebasedPO(noRec : Integer, id : String(20), startdate : String(20), enddate : String(20), dummy : String(25)) returns String;


    @(requires: 'create')
    action createjobschedule(appurl : String(1024), cron : String(40), description : String(100), endtime : String(40), jobname : String(40), starttime : String(40)) returns String;
}

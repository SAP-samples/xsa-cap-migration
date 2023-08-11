using {UserData} from '../db/cds/UserData';
// using {UserData} from '../user-db/UserData';
using {Core} from '../db/cds/Core';
using {MD} from '../db/cds/MD';
using {PO_POVIEW} from '../db/cds/datamodel';
using {SAP_HANA_DEMOCONTENT_EPM_MODELS_PROD as PROD} from '../db/cds/datamodel';
using {SAP_HANA_DEMOCONTENT_EPM_MODELS_PO_HEADER_EN as PO_HEADER} from '../db/cds/datamodel';
using {SAP_HANA_DEMOCONTENT_EPM_MODELS_PO_ITEM as POITEM} from '../db/cds/datamodel';
using {PO_HEADERVIEW} from '../db/cds/datamodel';
using {PO} from '../db/cds/PO';
using {SO} from '../db/cds/SO';
using {Jobs} from '../db/cds/Jobs';
using {POTextSearch} from '../db/cds/POTextSearchViews';
using {SAP_HANA_DEMOCONTENT_EPM_SPATIAL_MODELS_BP_ADDRESS_DETAILS as SPATIALAdd} from '../db/cds/datamodel';
using {SAP_HANA_DEMOCONTENT_EPM_MODELS_PURCHASE_COMMON_CURRENCY as Currency} from '../db/cds/datamodel';


service ShineService @(requires: 'authenticated-user') @(path: '/shine') {
    define view potext_shine_search with parameters TERM: String(40),ATTRIBUTE: String(20) as
        SELECT from POTextSearch(TERMS::TERM,ATTRIBUTE::ATTRIBUTE){
	        RESULTS,
	        ATTRIBUTE
        };
    entity Users                as projection on UserData.User;
    entity BusinessPartners     as projection on MD.BusinessPartner;
    entity purchaseDetails      as projection on PO_POVIEW;
    entity PurchaseOrderHeader  as projection on PO_HEADERVIEW;
    entity ProductDetails       as projection on PROD;
    entity PO_WORKLIST          as projection on PO_HEADER;
    entity PurchaseOrderItem    as projection on POITEM;
    entity PO_POHEADER          as projection on PO.Header;
    entity PO_ITEM              as projection on PO.Item;
    entity Products             as projection on MD.Products;
    entity so_details           as projection on SO.Header;
    entity salesDetails         as projection on SO.Item;
    entity MapKeys              as projection on Core.MapKeys;
    entity JOBS_DATA            as projection on Jobs.Data;
    entity JOBS_SCHEDULEDETAILS as projection on Jobs.ScheduleDetails;
    entity Spatial_Address      as projection on SPATIALAdd;
    entity Common_Currency      as projection on Currency;
}

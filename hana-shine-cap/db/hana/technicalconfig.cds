using from '../cds/MD';
using  from '../cds/PurchaseOrder';
using  from '../cds/Util';
extend projection MD.Addresses @sql.append:'unload priority 8';
extend projection MD.BusinessPartner @sql.append:`partition by HASH  (PARTNERID) Partitions GET_NUM_SERVERS()`;
extend projection  PurchaseOrder.ItemView  @sql.append:'with structured privilege check';
context PurchaseOrder {
    type BusinessKey : String(10);
	type SDate : Date;
	type CurrencyT : String(5);
	type AmountT : Decimal(15,2);
	type QuantityT : Decimal(13,3);
	type UnitT: String(3);
	type StatusT: String(1);
	
 	Type HistoryT {
          CREATEDBY : BusinessKey;
          CREATEDAT : SDate;
          CHANGEDBY : BusinessKey;
          CHANGEDAT : SDate; 
        };

    @sql.append: ```
    technical configuration { 
        column store;
     }
    ```
    Entity Header {
        key  PURCHASEORDERID: BusinessKey;
        ITEMS: Association[*] to Item on ITEMS.PURCHASEORDERID = PURCHASEORDERID;        
        HISTORY: HistoryT;
        NOTEID: BusinessKey null;
        PARTNER: BusinessKey;
        CURRENCY: CurrencyT;
        GROSSAMOUNT: AmountT;
        NETAMOUNT: AmountT;
        TAXAMOUNT: AmountT;
        LIFECYCLESTATUS: StatusT;
        APPROVALSTATUS: StatusT;
        CONFIRMSTATUS: StatusT;
        ORDERINGSTATUS: StatusT;
        INVOICINGSTATUS: StatusT;
      };

    @sql.append: ```
    technical configuration { 
        column store;
     }
    ```
    Entity Item {
        key  PURCHASEORDERID: BusinessKey;
        key  PURCHASEORDERITEM: BusinessKey;
      	HEADER: Association[1] to Header on HEADER.PURCHASEORDERID = PURCHASEORDERID; 
        PRODUCT:  BusinessKey;
        NOTEID: BusinessKey null;
        CURRENCY: CurrencyT;
        GROSSAMOUNT: AmountT;
        NETAMOUNT: AmountT;
        TAXAMOUNT: AmountT;
	    QUANTITY: QuantityT;
		QUANTITYUNIT: UnitT;
		DELIVERYDATE: SDate;
      };

   @sql.append:'with structured privilege check'
   define view ItemView as SELECT from Item {
      PURCHASEORDERID as ![PurchaseOrderItemId], 
      PURCHASEORDERITEM as ![ItemPos],
      HEADER.PARTNER as ![PartnerId],
  	  PRODUCT as ![ProductID],
  	  CURRENCY as ![CurrencyCode],
      GROSSAMOUNT as ![Amount],
      NETAMOUNT as ![NetAmount],
      TAXAMOUNT as ![TaxAmount],
  	  QUANTITY as ![Quantity],
  	  QUANTITYUNIT as ![QuantityUnit],
  	  DELIVERYDATE as ![DeliveryDate1]
   };
   
};
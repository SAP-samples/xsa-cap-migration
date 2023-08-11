using Core as EPM;


context MD {

Type HistT {
        CREATEDBY : Association to Employees;
        CREATEDAT : EPM.SDate;
        CHANGEDBY : Association to Employees;
        CHANGEDAT : EPM.SDate; 
    };
    
 Type NameT {
        FIRST : EPM.SString;
        MIDDLE : EPM.SString;
        LAST : EPM.SString;
        INITIALS : EPM.BusinessKey;
      };
 type SexT : String(1);
 
    Entity Addresses {
        key  ADDRESSID: EPM.BusinessKey;
        CITY: EPM.SString;
        POSTALCODE: EPM.BusinessKey;
        STREET: EPM.MString;
        BUILDING: EPM.BusinessKey;
        COUNTRY: String(3);
        REGION: String(4);
        ADDRESSTYPE: String(2);
        VALIDITY: EPM.ValidityT;   
        LATITUDE: Double;
        LONGITUDE: Double; 
    };
    

    Entity BusinessPartner {
        key  PARTNERID: EPM.BusinessKey         @title : 'BusinessPartner Header Entity';
        PARTNERROLE: String(3); //Business Partner Role
        EMAILADDRESS: EPM.LString;
        PHONENUMBER: EPM.PhoneT;
        FAXNUMBER: EPM.PhoneT null;
        WEBADDRESS: EPM.VLString;
        ADDRESSES: Association to Addresses null;
        COMPANYNAME: String(80);
        LEGALFORM: EPM.BusinessKey;
        HISTORY: HistT;
        CURRENCY: EPM.CurrencyT;
    };
 
    Entity Employees {
        key  EMPLOYEEID: EPM.BusinessKey;
        NAME: NameT null;
        SEX: SexT;
        LANGUAGE: EPM.ABAPLanguage;
        PHONENUMBER: EPM.PhoneT null;
        EMAILADDRESS: EPM.LString;
        LOGINNAME: String(12);
        ADDRESSES: Association to Addresses null;
        VALIDITY: EPM.ValidityT; 
        CURRENCY: EPM.CurrencyT;                
        SALARYAMOUNT: EPM.AmountT;
        ACCOUNTNUMBER: EPM.BusinessKey;
        BANKID: EPM.BusinessKey;
        BANKNAME: EPM.LString;
        EMPLOYEEPICURL: EPM.LString;
        FULLNAME: String(100) = (NAME.FIRST || ' ' || NAME.LAST) stored;
    };
    Entity Products {
        key  PRODUCTID: EPM.BusinessKey; 
		TYPECODE: String(2);
		CATEGORY: EPM.SString;
        HISTORY: HistT;
        NAMEID: EPM.BusinessKey;
        DESCID: EPM.BusinessKey;
        SUPPLIER: Association to MD.BusinessPartner;
        TAXTARIFFCODE: Integer;
        QUANTITYUNIT: EPM.UnitT;
        WEIGHTMEASURE: EPM.QuantityT;
        WEIGHTUNIT: EPM.UnitT; 
        CURRENCY: EPM.CurrencyT;
        PRICE: EPM.AmountT;
        PRODUCTPICURL: EPM.LString null;
        WIDTH: EPM.QuantityT;
        DEPTH: EPM.QuantityT;
        HEIGHT: EPM.QuantityT;
        DIMENSIONUNIT: EPM.UnitT;
    };

    Entity productLog{
     key PRODUCTID: String(10);
     key LOGID: Integer;
     key DATETIME: DateTime;
     key USERNAME: String(20);
	 LOGTEXT: String(500);
    }; 
 
}; 

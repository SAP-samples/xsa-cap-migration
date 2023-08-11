context Product {

    Entity Products{
     key PRODUCTID: String(10);
     CATEGORY: String(40);
     PRICE: Decimal(15,2);
    }; 

    Entity ProductLog{
     key PRODUCTID: String(10);
     key LOGID: Integer;
     key DATETIME: DateTime;
     key USERNAME: String(80);
     LOGTEXT: String(500);
    };
};



context UserData {
       @cds.persistence.exists
	entity User {
        key UserId: Integer;
        FirstName: String(40);
        LastName: String(40);
        Email: String(255);
     };        

};
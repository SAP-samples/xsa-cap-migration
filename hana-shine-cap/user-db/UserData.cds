context UserData {
    @title : 'User DB'
    entity User {
            @title : 'User ID'
        	key UserId    : Integer;

            @title : 'First Name'
            FirstName : String(40);

            @title : 'Last Name'
            LastName  : String(40);

            @title : 'Email'
            Email     : String(255);
    };
};

//First create initial function call and place call at EOF ex - $(rmSearch);

//Create constant for API URL
//const userURL = '/'

const MOCK_USER_DATA = [
    {firstName: 'Rick', 
    lastName: 'Sanchez',
    email: 'rick.sanchez@test.com',
    password: 'test1099'},

    {firstName: 'Morty', 
    lastName: 'Smith',
    email: 'morty.smith@test.com',
    password: 'test9033'}

  ];

//First function that is in the EOF call
function userSearch () {
    
    //listen on FORM class in HTML and submit with arg function with arg event
    $('js-loginForm').submit(function(event) {
        
        console.log('click');

        //on the event prevent default behavior with no args
        event.preventDefault();

        //create variable by listening for value entered into FORM fields
        let userid = $('js-userIdfield');
        let userPass = $('js-userPassField');

        //call next function by name of function with args of <userValue(s)> and future "render/task" function  
            //Data returned from callback will send to "render/task" function  
    console.log('userid: ', userid);
    console.log('userPass: ', userPass);

        findUser(userid, userPass, checkUser)

    });
};


//2nd function with args - <userValue(s)> and callback to send data BACK to first function
function findUser(userid, userPass, callback) {

    //create variable object for search string - this example could be handled without if const URL included name params
    let query = {
        userid: `${userid}`,
        userPass: `${userPass}`
    }
    console.log('query: ', query);

    //jQuery getJSON call that includes API URL const, query, and callback to return data to first function
   // $.getJSON(userURL, query, callback);
    
   let validUser= MOCK_USER_DATA.map(userid) => {

        if (!(userid)) {
            console.log('Invalid user');
            return 'Invalid user';
        }

        else {}
   } 
};


//results function, single arg of data which is returned from the callback

function checkUser(data) {

    console.log('data: ', data);

};

    
    //create const for new array after mapping data arg
      //  console.log('map data: ', data)


      //return params present in data as HTML to pass to lower jQuery html display

    //renter returned HTML to screen at appropriate class object



    $(userSearch);
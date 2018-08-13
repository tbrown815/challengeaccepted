//First create initial function call and place call at EOF ex - $(rmSearch);

//Create constant for API URL
const userAuth = 'http://localhost:8080/auth/login/'
const getUserTokenURL = 'http://localhost:8080/users/getuser/'

//let authToken;

//First function that is in the EOF call
function userSearch () {
    
    //listen on FORM class in HTML and submit with arg function with arg event
    $('.js-loginForm').unbind().submit(function(event) {
        
        //on the event prevent default behavior with no args
        event.preventDefault();
        
        //create variable by listening for value entered into FORM fields
        let username = $('.js-userIdfield').val();
        let password = $('.js-userPassField').val();
        
        //call next function by name of function with args of <userValue(s)> and future "render/task" function  
        //Data returned from callback will send to "render/task" function  
        console.log('username: ', username);
        console.log('password: ', password);
        
        $('.js-loginForm')[0].reset();
        
        findUser(username, password)

    });
};


//2nd function with args - <userValue(s)> and callback to send data BACK to first function
function findUser(username, password) {

    let userToken = {
        async: true,
        crossDomain: true,
        url: `${getUserTokenURL}` + `${username}`,
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
        processData: false,
        //data: JSON.stringify(`${username}`),
        success: function(response) {
                sessionStorage.setItem('userToken', JSON.stringify(response.id)) 
        }
    }

    $.ajax(userToken).done(function(response) {
        console.log('user response: ', response)
    })

    let query = {
        async: true,
        crossDomain: true,
        url: `${userAuth}`,
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        processData: false,
        data: JSON.stringify({username: `${username}`,password: `${password}`}),
        success: function(response) {
                sessionStorage.setItem('authToken', JSON.stringify(response.authToken))
                //authToken = response;
                //alert("success!")
                location.href = "/ChallengeAccepted/clientSite/index.html"
            }
        } 
        
        console.log('query = ', query)
        
        $.ajax(query).done(function(response) {
            console.log('response: ', response)

    // WHY DOESN'T THIS WORK?
        if (!response.authToken) {
            console.log('response: ', response)
            alert("Unable to authorize access")
        }
        
    });
    


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
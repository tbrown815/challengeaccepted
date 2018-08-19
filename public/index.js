//First create initial function call and place call at EOF ex - $(rmSearch);

//Create constant for API URL


function checkEnv() {
    
    let envHost = window.location.hostname;
    let envName = envHost.search('heroku');
    
    
    if (envName > 1) {
        console.log('envName > 1: ', envName > 1)
        const userAuth = '/auth/login/'
        const userURL = '/users'
        const getUserTokenURL = '/users/getuser/'
    }

    else {
        const userAuth = 'http://localhost:8080/auth/login/'
        const userURL = 'http://localhost:8080/users'
        const getUserTokenURL = 'http://localhost:8080/users/getuser/'
    };
};

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
    console.log('username: ', username) 
    console.log('password: ', password) 

        
        let query = {
            async: true,
            crossDomain: true,
            url: `${userAuth}`,
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            processData: false,
            data: JSON.stringify({username: `${username}`,password: `${password}`}),
            error: function (xhr) { 
                let err = xhr.responseText;
                if (err === 'Unauthorized'){
                  alert('Unable to authorize access, try again.')
                }
            },
            success: function(response) {
                sessionStorage.setItem('authToken', JSON.stringify(response.authToken))
                $.ajax(getUserToken)
            }
        } 
        
        console.log('query = ', query)
        
        $.ajax(query).done(function(response) {
            console.log('response: ', response)
        
    });
    
    let getUserToken = {
        async: true,
        crossDomain: true,
        url: `${getUserTokenURL}` + `${username}`,
        method: 'GET',
        headers: {        
            'Content-Type': 'application/json',
            },
        processData: false,
        error: function (xhr) { 
            errFunc(xhr)
            },
        success: function(response) {
            sessionStorage.setItem('userToken', JSON.stringify(response.id))
            sessionStorage.setItem('lifeDistance', JSON.stringify(response.lifeDistance))
            sessionStorage.setItem('lifeSteps', JSON.stringify(response.lifeSteps))
            sessionStorage.setItem('username', username) 

            location.href = "/ChallengeAccepted/clientSite/index.html"

            }
        }


};

//results function, single arg of data which is returned from the callback

function createUser() {

    $('.js-newUserForm').unbind().submit(function(event) {

        event.preventDefault();

        let firstName = $('.js-newUserFirstField').val()
        let lastName = $('.js-newUserLastField').val()
        let email = $('.js-newUserEmailField').val()
        let username = $('.js-newUserIdField').val()
        let password = $('.js-newUserPassField').val()
        let passwordConf = $('.js-newUserPassConfField').val()


        console.log('firstName: ', firstName) 
        console.log('lastName: ', lastName) 
        console.log('email: ', email) 
        console.log('username: ', username) 
        console.log('password: ', password) 
        console.log('passwordConf: ', passwordConf) 

        if (password !== passwordConf) {
            alert('Your passwords do not match!')
            return;
        }

        else {      

            let createNewQuery = {
                async: true,
                crossDomain: true,
                url: `${userURL}`,
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                processData: false,
                data: JSON.stringify({firstName: `${firstName}`, lastName: `${lastName}`, email: `${email}`,username: `${username}`,password: `${password}`,lifeSteps: '0',lifeDistance: '0'}),
                error: function (xhr) { 
                    errFunc(xhr)
                    },
                success: function(response) {
                    console.log('success response: ', response)

                       //alert("Congratulations, you now have an account!")
                        
                        $('#closeNewUserModal')[0].click()

                        findUser(username, password);
                    }
                } 
                
                console.log('createNewQuery = ', createNewQuery)
                
                $.ajax(createNewQuery).done(function(response) {
                    console.log('response: ', response)
            })
        }

    })
};
    
function errFunc(xhr) {
  return  alert(`${xhr.responseJSON.reason}: ${xhr.responseJSON.location} ${xhr.responseJSON.message}`)

}

function publicPage() {
    checkEnv();
    userSearch();
    createUser();
}


$(publicPage);
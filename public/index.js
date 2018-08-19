'use strict';

//First create initial function call and place call at EOF ex - $(rmSearch);

//Create constant for API URL

var userAuth = void 0;
var userURL = void 0;
var getUserTokenURL = void 0;
var loginRedirect = void 0;

function checkEnv() {

    var envHost = window.location.hostname;
    var envName = envHost.search('heroku');

    if (envName > 1) {
        console.log('envName > 1: ', envName > 1);
        userAuth = '/auth/login/';
        userURL = '/users';
        getUserTokenURL = '/users/getuser/';
        loginRedirect = '/clientSite/index.html';
    } else {
        userAuth = 'http://localhost:8080/auth/login/';
        userURL = 'http://localhost:8080/users';
        getUserTokenURL = 'http://localhost:8080/users/getuser/';
        loginRedirect = '/ChallengeAccepted/clientSite/index.html';
    };
};

//First function that is in the EOF call
function userSearch() {

    //listen on FORM class in HTML and submit with arg function with arg event
    $('.js-loginForm').unbind().submit(function (event) {

        //on the event prevent default behavior with no args
        event.preventDefault();

        //create variable by listening for value entered into FORM fields
        var username = $('.js-userIdfield').val();
        var password = $('.js-userPassField').val();

        //call next function by name of function with args of <userValue(s)> and future "render/task" function  
        //Data returned from callback will send to "render/task" function  
        console.log('username: ', username);
        console.log('password: ', password);

        $('.js-loginForm')[0].reset();

        findUser(username, password);
    });
};

//2nd function with args - <userValue(s)> and callback to send data BACK to first function
function findUser(username, password) {
    console.log('username: ', username);
    console.log('password: ', password);

    var query = {
        async: true,
        crossDomain: true,
        url: '' + userAuth,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        processData: false,
        data: JSON.stringify({ username: '' + username, password: '' + password }),
        error: function error(xhr) {
            var err = xhr.responseText;
            if (err === 'Unauthorized') {
                alert('Unable to authorize access, try again.');
            }
        },
        success: function success(response) {
            sessionStorage.setItem('authToken', JSON.stringify(response.authToken));
            $.ajax(getUserToken);
        }
    };

    console.log('query = ', query);

    $.ajax(query).done(function (response) {
        console.log('response: ', response);
    });

    var getUserToken = {
        async: true,
        crossDomain: true,
        url: '' + getUserTokenURL + ('' + username),
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        processData: false,
        error: function error(xhr) {
            errFunc(xhr);
        },
        success: function success(response) {
            sessionStorage.setItem('userToken', JSON.stringify(response.id));
            sessionStorage.setItem('lifeDistance', JSON.stringify(response.lifeDistance));
            sessionStorage.setItem('lifeSteps', JSON.stringify(response.lifeSteps));
            sessionStorage.setItem('username', username);

            location.href = loginRedirect;
        }
    };
};

//results function, single arg of data which is returned from the callback

function createUser() {

    $('.js-newUserForm').unbind().submit(function (event) {

        event.preventDefault();

        var firstName = $('.js-newUserFirstField').val();
        var lastName = $('.js-newUserLastField').val();
        var email = $('.js-newUserEmailField').val();
        var username = $('.js-newUserIdField').val();
        var password = $('.js-newUserPassField').val();
        var passwordConf = $('.js-newUserPassConfField').val();

        console.log('firstName: ', firstName);
        console.log('lastName: ', lastName);
        console.log('email: ', email);
        console.log('username: ', username);
        console.log('password: ', password);
        console.log('passwordConf: ', passwordConf);

        if (password !== passwordConf) {
            alert('Your passwords do not match!');
            return;
        } else {

            var createNewQuery = {
                async: true,
                crossDomain: true,
                url: '' + userURL,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                processData: false,
                data: JSON.stringify({ firstName: '' + firstName, lastName: '' + lastName, email: '' + email, username: '' + username, password: '' + password, lifeSteps: '0', lifeDistance: '0' }),
                error: function error(xhr) {
                    errFunc(xhr);
                },
                success: function success(response) {
                    console.log('success response: ', response);

                    //alert("Congratulations, you now have an account!")

                    $('#closeNewUserModal')[0].click();

                    findUser(username, password);
                }
            };

            console.log('createNewQuery = ', createNewQuery);

            $.ajax(createNewQuery).done(function (response) {
                console.log('response: ', response);
            });
        }
    });
};

function errFunc(xhr) {
    return alert(xhr.responseJSON.reason + ': ' + xhr.responseJSON.location + ' ' + xhr.responseJSON.message);
}

function publicPage() {
    checkEnv();
    userSearch();
    createUser();
}

$(publicPage);

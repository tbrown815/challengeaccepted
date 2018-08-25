let userAuth = '/auth/login/';
let userURL = '/users';
let getUserTokenURL = '/users/getuser/';
let loginRedirect = '/clientSite/index.html';

//listen for username and password from login submit
function userSearch() {

    $('.js-loginForm').unbind().submit(function (event) {

        event.preventDefault();

        let username = $('.js-userIdfield').val();
        let password = $('.js-userPassField').val();

        $('.js-loginForm')[0].reset();

        findUser(username, password)

    });
};

//send username and password, if valid recieve jwt, jwt saved to session storage
function findUser(username, password) {

    let query = {
        async: true,
        crossDomain: true,
        cache: false,
        url: `${userAuth}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        processData: false,
        data: JSON.stringify({ username: `${username}`, password: `${password}` }),
        error: function (xhr) {
            let err = xhr.responseText;
            if (err === 'Unauthorized') {
                alert('Unable to authorize access, try again.  User ID and passwords are case sensitive.')
            }
        },
        success: function (response) {
            sessionStorage.setItem('authToken', JSON.stringify(response.authToken))
            $.ajax(getUserToken)
        }
    }

    $.ajax(query).done(function (response) {
        return;
    });

//retrieve usertoken from DB and save to session storage
    let getUserToken = {
        async: true,
        crossDomain: true,
        cache: false,
        url: `${getUserTokenURL}` + `${username}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        processData: false,
        error: function (xhr) {
            errFunc(xhr)
        },
        success: function (response) {
            sessionStorage.setItem('userToken', JSON.stringify(response.id))
            sessionStorage.setItem('lifeDistance', JSON.stringify(response.lifeDistance))
            sessionStorage.setItem('lifeSteps', JSON.stringify(response.lifeSteps))
            sessionStorage.setItem('username', username)

            location.href = loginRedirect;

        }
    }


};

//listen for new user values and save to DB on submit
function createUser() {

    $('.js-newUserForm').unbind().submit(function (event) {

        event.preventDefault();

        let firstName = $('.js-newUserFirstField').val()
        let lastName = $('.js-newUserLastField').val()
        let email = $('.js-newUserEmailField').val()
        let username = $('.js-newUserIdField').val()
        let password = $('.js-newUserPassField').val()
        let passwordConf = $('.js-newUserPassConfField').val()

        if (password !== passwordConf) {
            alert('Your passwords do not match!')
            return;
        }

        else {

            let createNewQuery = {
                async: true,
                crossDomain: true,
                cache: false,
                url: `${userURL}`,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                processData: false,
                data: JSON.stringify({ firstName: `${firstName}`, lastName: `${lastName}`, email: `${email}`, username: `${username}`, password: `${password}`, lifeSteps: '0', lifeDistance: '0' }),
                error: function (xhr) {
                    errFunc(xhr)
                },
                success: function (response) {

                    $('#closeNewUserModal')[0].click()

                    findUser(username, password);
                }
            }

            $.ajax(createNewQuery).done(function (response) {
                return;

            })
        }

    })
};

//function for error message alert display
function errFunc(xhr) {
    return alert(`${xhr.responseJSON.reason}: ${xhr.responseJSON.location} ${xhr.responseJSON.message}`)

}

function publicPage() {
    userSearch();
    createUser();
}


$(publicPage);
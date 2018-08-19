'use strict';

var authToken = JSON.parse('' + sessionStorage.getItem('authToken'));
var userToken = JSON.parse('' + sessionStorage.getItem('userToken'));
var username = sessionStorage.getItem('username');
var totalSteps = JSON.parse('' + sessionStorage.getItem('lifeSteps'));
var totalDistance = JSON.parse('' + sessionStorage.getItem('lifeDistance'));

var getuserStatsURL = void 0;
var userStatsURL = void 0;
var userLifeTimeURL = void 0;
var loginRedirect = void 0;

function checkEnv() {

    var envHost = window.location.hostname;
    var envName = envHost.search('heroku');

    if (envName > 1) {
        console.log('envName > 1: ', envName > 1);

        getuserStatsURL = '/site/stats/';
        userStatsURL = '/site/';
        userLifeTimeURL = '/users/update/';
        loginRedirect = '/';
    } else {
        getuserStatsURL = 'http://localhost:8080/site/stats/';
        userStatsURL = 'http://localhost:8080/site/';
        userLifeTimeURL = 'http://localhost:8080/users/update/';
        loginRedirect = '/ChallengeAccepted/public/index.html';
    };
};

function getUserStats() {
    //   setTimeout(function() {userBack(MOCK_USER_STATS)}, 1);
    if (authToken === null || userToken === null) {
        sessionStorage.clear();
        location.href = loginRedirect;
    };

    var userStats = {
        async: true,
        crossDomain: true,
        url: '' + getuserStatsURL + ('' + userToken),
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + authToken
        },
        error: function error(xhr) {
            errFunc(xhr);
        },
        success: function success(response) {
            console.log('user stat success');
        }
    };

    $.ajax(userStats).done(function (response) {
        console.log('user response: ', response);
        displayUserStats(response);
    });
}

function displayUserStats(data) {
    console.log('data: ', data);

    var userStatArray = data.userStats;

    $('.js-lifeStats').html('\n        <H2 class=\'boxTitle\'>Lifetime stats:</h2>\n        <ul class=\'topBullet\'>\n        <li><b>Lifetime Steps:</b> ' + totalSteps + '\n        <li><b>Lifetime Distance:</b> ' + totalDistance + ' miles\n        </ul>');

    $('.js-personStats').append('<h2 class=\'boxTitle\'>Recent Activity:</h2>');

    console.log('userStatArray: ', userStatArray);

    if (userStatArray.length < 1 || userStatArray === null || userStatArray === undefined) {
        $('.js-personStats').append('\n                    <p>Log activities to the left.</p>\n                    \n                    <p>This section displays your last 10 recorded activities</p>');
    }

    for (index in data.userStats) {

        var statID = data.userStats[index].id;
        var exerDate = data.userStats[index].date.substring(0, 10);
        var numSteps = data.userStats[index].steps;
        var distance = data.userStats[index].distance;
        var exertype = data.userStats[index].exertype;

        if (numSteps === null && distance === null) {
            $('.js-personStats').append('\n                <ul class=\'topBullet\'>\n                <li>Date: ' + exerDate + '\n                <ul>\n                    <li> Activity: ' + exertype + '\n                    <li> <a href=\'#openEditModal\' class=\'js-editStats\' id=\'' + statID + '\' onclick=\'(this)\'>Edit</a> |\n                    <a href=\'#openDelModal\' class=\'js-delStats\' id=\'' + statID + '\' onclick=\'(this)\'>Delete</a>\n                </ul>\n                </ul>');
        } else if (numSteps === null) {
            $('.js-personStats').append('\n                <ul class=\'topBullet\'>\n                <li>Date: ' + exerDate + '\n                <ul>\n                    <li> Distance: ' + distance + ' miles\n                    <li> Activity: ' + exertype + '\n                    <li> <a href=\'#openEditModal\' class=\'js-editStats\' id=\'' + statID + '\' onclick=\'(this)\'>Edit</a> |\n                        <a href=\'#openDelModal\' class=\'js-delStats\' id=\'' + statID + '\' onclick=\'(this)\'>Delete</a>\n                </ul>\n                </ul>');
        } else if (distance === null) {
            $('.js-personStats').append('\n                <ul class=\'topBullet\'>\n                <li>Date: ' + exerDate + '\n                <ul>\n                    <li> # Steps: ' + numSteps + '\n                    <li> Activity: ' + exertype + '\n                    <li> <a href=\'#openEditModal\' class=\'js-editStats\' id=\'' + statID + '\' onclick=\'(this)\'>Edit</a> |\n                        <a href=\'#openDelModal\' class=\'js-delStats\' id=\'' + statID + '\' onclick=\'(this)\'>Delete</a>\n                </ul>\n                </ul>');
        } else {
            $('.js-personStats').append('\n                <ul class=\'topBullet\'>\n                <li>Date: ' + exerDate + '\n                <ul>\n                    <li> # Steps: ' + numSteps + '\n                    <li> Distance: ' + distance + ' miles\n                    <li> Activity: ' + exertype + '\n                    <li> <a href=\'#openEditModal\' class=\'js-editStats\' id=\'' + statID + '\' onclick=\'(this)\'>Edit</a> |\n                        <a href=\'#openDelModal\' class=\'js-delStats\' id=\'' + statID + '\' onclick=\'(this)\'>Delete</a>\n                </ul>\n                </ul>');
        }
    }

    $('.js-editStats').unbind().click(function () {

        //on the event prevent default behavior with no args
        //event.preventDefault();

        var clickedId = $(this).attr('id');

        console.log('edit id: ', clickedId);

        editGetStats(clickedId);
    });

    $('.js-delStats').unbind().click(function () {

        //on the event prevent default behavior with no args
        //event.preventDefault();

        var clickedId = $(this).attr('id');

        console.log('del id: ', clickedId);

        delGetStats(clickedId);
    });
}

function editGetStats(data) {

    var editID = data;

    var findStat = {
        async: true,
        crossDomain: true,
        url: '' + userStatsURL + ('' + editID),
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + authToken
        },
        error: function error(xhr) {
            errFunc(xhr);
        },
        success: function success() {
            console.log('user stat retrieved');
        }
    };

    $.ajax(findStat).done(function (response) {
        displayEditStats(response, editID);
    });
}

function displayEditStats(data, editID) {
    console.log('edit data: ', data);

    editID = editID;
    var exerDate = data.date.substring(0, 10);
    var numSteps = data.steps;
    var distance = data.distance;
    var exertype = data.exertype;

    $('#editDateEntry').val(exerDate);
    $('#editStepsField').val(numSteps);
    $('#editDistanceField').val(distance);
    $('#selectEditExerType').val(exertype);

    saveEditStats(exerDate, numSteps, distance, exertype, editID);
}

function saveEditStats(exerDate, numSteps, distance, exertype, editID) {

    $('.js-editExerForm').unbind().submit(function (event) {

        event.preventDefault();

        editID = editID;
        var newExerDate = $('#editDateEntry').val();
        var newNumSteps = $('#editStepsField').val();
        var newDistance = $('#editDistanceField').val();
        var newExertype = $('#selectEditExerType').val();

        var updateSteps = 0;
        var updateDistance = 0;

        var numStepsUpdate = 0;
        var numDistanceUpdate = 0;

        if (newNumSteps == numSteps) {

            numStepsUpdate = parseFloat(newNumSteps) - parseFloat(numSteps);

            updateSteps = parseFloat(totalSteps) + parseFloat(numStepsUpdate);
        }

        if (newNumSteps > numSteps) {

            numStepsUpdate = parseFloat(newNumSteps) - parseFloat(numSteps);

            updateSteps = parseFloat(totalSteps) + parseFloat(numStepsUpdate);
        }

        if (newNumSteps < numSteps) {

            numStepsUpdate = parseFloat(numSteps) - parseFloat(newNumSteps);

            updateSteps = parseFloat(totalSteps) - parseFloat(numStepsUpdate);
        }

        if (newNumSteps == 0 || newNumSteps == null || newNumSteps == undefined) {

            if (newNumSteps == null || newNumSteps == undefined) {
                newNumSteps = 0;
            }

            updateSteps = parseFloat(totalSteps) - parseFloat(numSteps);
        }

        if (newDistance == distance) {

            numStepsUpdate = parseFloat(newDistance) - parseFloat(distance);

            updateDistance = parseFloat(totalDistance) + parseFloat(numStepsUpdate);
        }

        if (newDistance > distance) {

            numStepsUpdate = parseFloat(newDistance) - parseFloat(distance);

            updateDistance = parseFloat(totalDistance) + parseFloat(numStepsUpdate);
        }

        if (newDistance < distance) {

            numStepsUpdate = parseFloat(distance) - parseFloat(newDistance);

            updateDistance = parseFloat(totalDistance) - parseFloat(numStepsUpdate);
        }

        if (newDistance == 0 || newDistance == null || newDistance == undefined) {

            if (newDistance == null || newDistance == undefined) {
                newDistance = 0;
            }

            updateDistance = parseFloat(totalDistance) - parseFloat(distance);
        }

        var editStats = {
            async: true,
            crossDomain: true,
            url: '' + userStatsURL + ('' + editID),
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + authToken
            },
            processData: false,
            data: JSON.stringify({ id: '' + editID, date: '' + newExerDate, steps: '' + newNumSteps, distance: '' + newDistance, exertype: '' + newExertype }),
            error: function error(xhr) {
                errFunc(xhr);
            },
            success: function success(response) {
                console.log('user stat updated');
                $('#closeEditModal')[0].click();
                updateLifeTimeInfo(updateSteps, updateDistance);
            }
        };

        console.log('editStats: ', editStats);
        $.ajax(editStats);
    });
}

function delGetStats(data) {

    var delID = data;

    var findStat = {
        async: true,
        crossDomain: true,
        url: '' + userStatsURL + ('' + delID),
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + authToken
        },
        error: function error(xhr) {
            errFunc(xhr);
        },
        success: function success(response) {
            delStats(response);
            console.log('user stat retrieved');
        }
    };

    $.ajax(findStat);
}

function delStats(response) {
    console.log('delStat data: ', response);

    delID = response.id;
    var numSteps = response.steps;
    var numDistance = response.distance;

    $('.js-delExerForm').unbind().submit(function (event) {

        event.preventDefault();

        var updateSteps = parseFloat(totalSteps) - parseFloat(numSteps);
        var updateDistance = parseFloat(totalDistance) - parseFloat(numDistance);

        var delStats = {
            async: true,
            crossDomain: true,
            url: '' + userStatsURL + ('' + delID),
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + authToken
            },
            error: function error(xhr) {
                errFunc(xhr);
            },
            success: function success() {
                console.log('user stat removed');
                $('#closeDelModal')[0].click();
                updateLifeTimeInfo(updateSteps, updateDistance);
            }
        };

        $.ajax(delStats);
    });
}

function newExerStat() {

    $('.js-enterStatsForm').unbind().submit(function (event) {

        event.preventDefault();

        var addExerDate = $('#execDateEntry').val();
        var addNumSteps = $('#stepsField').val();
        var addDistance = $('#distanceField').val();
        var addExertype = $('#selectExerType').val();

        var updateSteps = parseFloat(totalSteps) + parseFloat(addNumSteps);

        var updateDistance = parseFloat(totalDistance) + parseFloat(addDistance);

        console.log('updateSteps: ', updateSteps);
        console.log('updateDistance: ', updateDistance);

        var newStats = {
            async: true,
            crossDomain: true,
            url: '' + userStatsURL,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + authToken
            },
            processData: false,
            data: JSON.stringify({ user: '' + userToken, date: '' + addExerDate, steps: '' + addNumSteps, distance: '' + addDistance, exertype: '' + addExertype }),
            error: function error(xhr) {
                errFunc(xhr);
            },
            success: function success(response) {
                console.log('user stat create');
                updateLifeTimeInfo(updateSteps, updateDistance);
            }
        };

        $.ajax(newStats);
    });
}

function updateLifeTimeInfo(updateSteps, updateDistance) {
    console.log('updateLifeTimeInfo start');

    var updateLifeTime = {

        async: true,
        crossDomain: true,
        url: '' + userLifeTimeURL + ('' + userToken),
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + authToken
        },
        processData: false,
        data: JSON.stringify({ id: '' + userToken, lifeSteps: '' + updateSteps, lifeDistance: '' + updateDistance }),
        error: function error(xhr) {
            errFunc(xhr);
        },
        success: function success() {
            sessionStorage.setItem('lifeSteps', JSON.stringify(updateSteps));
            sessionStorage.setItem('lifeDistance', JSON.stringify(updateDistance));
            console.log('lifetime stats updated');
            location.reload(true);
        }
    };

    $.ajax(updateLifeTime);
};

function userLogOut() {
    $('.js-topNav').html('\n    <div class=\'navInfo\'>\n    <h1>Challenge Accepted</h1>\n    <h2 class=\'userHello\'>Hello ' + username + '!</h2>\n    <a href=\'' + loginRedirect + '\' class=\'logoutLink js-logoutLink\' id=\'logoutLink\'>Logout</a>\n    </div>\n    ');

    $('#logoutLink').click(function (event) {
        // event.preventDefault();
        sessionStorage.clear();
    });
};

function errFunc(xhr) {
    return alert(xhr.responseJSON.reason + ': ' + xhr.responseJSON.location + ' ' + xhr.responseJSON.message);
};

function getAndDisplayInfo() {
    checkEnv();
    userLogOut();
    newExerStat();
    getUserStats(displayUserStats);

    /*
    $('.js-bottomtemp').html(`
    <p>TEMP DATA:</p>
    <ul>
    <li>authToken: ${authToken}
    <li>userToken: ${userToken}
    <li>username: ${username}
    </ul>`
    );
    */
}

$(getAndDisplayInfo);

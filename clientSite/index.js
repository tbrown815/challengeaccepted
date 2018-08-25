const authToken = JSON.parse(`${sessionStorage.getItem('authToken')}`);
const userToken = JSON.parse(`${sessionStorage.getItem('userToken')}`);
const username = sessionStorage.getItem('username');
const totalSteps = JSON.parse(`${sessionStorage.getItem('lifeSteps')}`);
const totalDistance = JSON.parse(`${sessionStorage.getItem('lifeDistance')}`);

let index;

let getuserStatsURL = '/site/stats/';
let userStatsURL = '/site/';
let userLifeTimeURL = '/users/update/';
let loginRedirect = '/'

//calls user stat endpoint to retrieve users stats
function getUserStats() {
//if authtoken or usertoken null redirect user to login page
    if (authToken === null || userToken === null) {
        sessionStorage.clear();
        location.href = loginRedirect;
    };

    let userStats = {
        async: true,
        crossDomain: true,
        cache: false,
        url: `${getuserStatsURL}` + `${userToken}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
        },
        error: function (xhr) {
            errFunc(xhr)
        },
        success: function (response) {
            return;
        }
    }

    $.ajax(userStats).done(function (response) {
        displayUserStats(response);
    })

}



//displays the user stats that were retrieved
function displayUserStats(data) {

    let userStatArray = data.userStats;

    $('.js-lifeStats').html(`
        <H2 class='boxTitle'>Lifetime stats:</h2>
        <ul class='topBullet'>
        <li><b>Lifetime Steps:</b> ${totalSteps.toFixed(0)}
        <li><b>Lifetime Distance:</b> ${totalDistance.toFixed(2)} miles
        </ul>`
    );

    $('.js-personStats').append(
        `<h2 class='boxTitle'>Recent Activity:</h2>`
    )

// IF no user stats display message to user to create stats
    if (userStatArray.length < 1 || userStatArray === null || userStatArray === undefined) {
        $('.js-personStats').append(`
                    <p>Log activities to the left.</p>
                    
                    <p>This section displays your last 10 recorded activities</p>`
        );

    }

    for (index in data.userStats) {


        let statID = data.userStats[index].id;
        let exerDate = data.userStats[index].date.substring(0, 10);
        let numSteps = data.userStats[index].steps;
        let distance = data.userStats[index].distance;
        let exertype = data.userStats[index].exertype;


        if (numSteps === null && distance === null) {
            $('.js-personStats').append(`
                <ul class='topBullet'>
                <li>Date: ${exerDate}
                <ul>
                    <li> Activity: ${exertype}
                    <li> <a href='#openEditModal' class='js-editStats' id='${statID}' onclick='(this)'>Edit</a> |
                    <a href='#openDelModal' class='js-delStats' id='${statID}' onclick='(this)'>Delete</a>
                </ul>
                </ul>`
            );

        }
        else if (numSteps === null) {
            $('.js-personStats').append(`
                <ul class='topBullet'>
                <li>Date: ${exerDate}
                <ul>
                    <li> Distance: ${distance} miles
                    <li> Activity: ${exertype}
                    <li> <a href='#openEditModal' class='js-editStats' id='${statID}' onclick='(this)'>Edit</a> |
                        <a href='#openDelModal' class='js-delStats' id='${statID}' onclick='(this)'>Delete</a>
                </ul>
                </ul>`
            );

        }
        else if (distance === null) {
            $('.js-personStats').append(`
                <ul class='topBullet'>
                <li>Date: ${exerDate}
                <ul>
                    <li> # Steps: ${numSteps}
                    <li> Activity: ${exertype}
                    <li> <a href='#openEditModal' class='js-editStats' id='${statID}' onclick='(this)'>Edit</a> |
                        <a href='#openDelModal' class='js-delStats' id='${statID}' onclick='(this)'>Delete</a>
                </ul>
                </ul>`
            );

        }
        else {
            $('.js-personStats').append(`
                <ul class='topBullet'>
                <li>Date: ${exerDate}
                <ul>
                    <li> # Steps: ${numSteps}
                    <li> Distance: ${distance} miles
                    <li> Activity: ${exertype}
                    <li> <a href='#openEditModal' class='js-editStats' id='${statID}' onclick='(this)'>Edit</a> |
                        <a href='#openDelModal' class='js-delStats' id='${statID}' onclick='(this)'>Delete</a>
                </ul>
                </ul>`
            );

        }

    }

//click watcher to enter edit stat flow
    $('.js-editStats').unbind().click(function () {

        let clickedId = $(this).attr('id');

        editGetStats(clickedId);
    })

//click watcher to enter delete stat flow
    $('.js-delStats').unbind().click(function () {

        let clickedId = $(this).attr('id');

        delGetStats(clickedId);
    })
}

//get stats to edit
function editGetStats(data) {

    let editID = data;

    let findStat = {
        async: true,
        crossDomain: true,
        cache: false,
        url: `${userStatsURL}` + `${editID}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
        },
        error: function (xhr) {
            errFunc(xhr)
        },
        success: function () {
            return;

        }
    }

    $.ajax(findStat).done(function (response) {
        displayEditStats(response, editID);
    })


}

//display stats to edit
function displayEditStats(data, editID) {

    editID = editID;
    let exerDate = data.date.substring(0, 10);
    let numSteps = data.steps;
    let distance = data.distance;
    let exertype = data.exertype;

    $('#editDateEntry').val(exerDate);
    $('#editStepsField').val(numSteps);
    $('#editDistanceField').val(distance);
    $('#selectEditExerType').val(exertype);

    saveEditStats(exerDate, numSteps, distance, exertype, editID);
}

//put updated status to DB and update user stats
function saveEditStats(exerDate, numSteps, distance, exertype, editID) {

    $("#editDateEntry").datepicker();


    $('.js-editExerForm').unbind().submit(function (event) {

        event.preventDefault();

        editID = editID;
        let newExerDate = $('#editDateEntry').val();
        let newNumSteps = $('#editStepsField').val();
        let newDistance = $('#editDistanceField').val();
        let newExertype = $('#selectEditExerType').val();

        let updateSteps = 0;
        let updateDistance = 0;

        let numStepsUpdate = 0;
        let numDistanceUpdate = 0;

        //If flow to determine adjustments to life steps
        if (newNumSteps == numSteps) {

            numStepsUpdate = parseFloat(newNumSteps) - parseFloat(numSteps)

            updateSteps = parseFloat(totalSteps) + parseFloat(numStepsUpdate);

        }

        if (newNumSteps > numSteps) {

            numStepsUpdate = parseFloat(newNumSteps) - parseFloat(numSteps)

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

        //If flow to determine adjustments to life distance
        if (newDistance == distance) {

            numDistanceUpdate = parseFloat(newDistance) - parseFloat(distance)

            updateDistance = parseFloat(totalDistance) + parseFloat(numDistanceUpdate);

        }

        if (newDistance > distance) {

            numDistanceUpdate = parseFloat(newDistance) - parseFloat(distance)

            updateDistance = parseFloat(totalDistance) + parseFloat(numDistanceUpdate);
        }

        if (newDistance < distance) {

            numDistanceUpdate = parseFloat(distance) - parseFloat(newDistance);

            updateDistance = parseFloat(totalDistance) - parseFloat(numDistanceUpdate);

        }

        if (newDistance == 0 || newDistance == null || newDistance == undefined) {

            if (newDistance == null || newDistance == undefined) {
                newDistance = 0;
            }

            updateDistance = parseFloat(totalDistance) - parseFloat(distance);

        }

        let editStats = {
            async: true,
            crossDomain: true,
            cache: false,
            url: `${userStatsURL}` + `${editID}`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`
            },
            processData: false,
            data: JSON.stringify({ id: `${editID}`, date: `${newExerDate}`, steps: `${newNumSteps}`, distance: `${newDistance}`, exertype: `${newExertype}` }),
            error: function (xhr) {
                errFunc(xhr)
            },
            success: function (response) {
                $('#closeEditModal')[0].click();
                //send to update life stats
                updateLifeTimeInfo(updateSteps, updateDistance)

            }
        }

        $.ajax(editStats);
    })

}


//get user stat for delete
function delGetStats(data) {

    let delID = data;


    let findStat = {
        async: true,
        crossDomain: true,
        cache: false,
        url: `${userStatsURL}` + `${delID}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
        },
        error: function (xhr) {
            errFunc(xhr)
        },
        success: function (response) {
            delStats(response);
            return;

        }
    }

    $.ajax(findStat)

}

//delete selected user stat by stat id
function delStats(response) {

    let delID = response.id;
    let numSteps = response.steps;
    let numDistance = response.distance;

    $('.js-delExerForm').unbind().submit(function (event) {


        event.preventDefault();

        //calc for removal of user life stats
        let updateSteps = parseFloat(totalSteps) - parseFloat(numSteps);
        let updateDistance = parseFloat(totalDistance) - parseFloat(numDistance);

        let delStats = {
            async: true,
            crossDomain: true,
            cache: false,
            url: `${userStatsURL}` + `${delID}`,
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`
            },
            error: function (xhr) {
                errFunc(xhr)
            },
            success: function () {
                $('#closeDelModal')[0].click()
                //send to update life stats
                updateLifeTimeInfo(updateSteps, updateDistance)
            }
        }

        $.ajax(delStats);
    })

}

//create new stat
function newExerStat() {

    $("#execDateEntry").datepicker();

    $('.js-enterStatsForm').unbind().submit(function (event) {

        event.preventDefault();


        let addExerDate = $('#execDateEntry').val();
        let addNumSteps = $('#stepsField').val();
        let addDistance = $('#distanceField').val();
        let addExertype = $('#selectExerType').val();

        //calc to update life stats
        let updateSteps = parseFloat(totalSteps) + parseFloat(addNumSteps);
        let updateDistance = parseFloat(totalDistance) + parseFloat(addDistance);

        let newStats = {
            async: true,
            crossDomain: true,
            cache: false,
            url: `${userStatsURL}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`
            },
            processData: false,
            data: JSON.stringify({ user: `${userToken}`, date: `${addExerDate}`, steps: `${addNumSteps}`, distance: `${addDistance}`, exertype: `${addExertype}` }),
            error: function (xhr) {
                errFunc(xhr)
            },
            success: function (response) {
                //send to update life stats
                updateLifeTimeInfo(updateSteps, updateDistance)
            }
        }

        $.ajax(newStats);
    })

}

//update life stats when sent from create/edit/delete flows
function updateLifeTimeInfo(updateSteps, updateDistance) {

    let updateLifeTime = {

        async: true,
        crossDomain: true,
        cache: false,
        url: `${userLifeTimeURL}` + `${userToken}`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
        },
        processData: false,
        data: JSON.stringify({ id: `${userToken}`, lifeSteps: `${updateSteps}`, lifeDistance: `${updateDistance}` }),
        error: function (xhr) {
            errFunc(xhr)
        },
        success: function () {
            sessionStorage.setItem('lifeSteps', JSON.stringify(updateSteps))
            sessionStorage.setItem('lifeDistance', JSON.stringify(updateDistance))
            location.reload(true);
        }
    }

    $.ajax(updateLifeTime);

};

//display welcome message and logout, on logout clear session storage and redirect to login page
function userLogOut() {
    $('.js-topNav').html(`
    <div class='navInfo'>
    <h1>Challenge Accepted</h1>
    <h2 class='userHello'>Hello ${username}!</h2>
    <a href='${loginRedirect}' class='logoutLink js-logoutLink' id='logoutLink'>Logout</a>
    </div>
    `)

    $('#logoutLink').click(function (event) {

        sessionStorage.clear();
    });

};

//function for error message alert display
function errFunc(xhr) {
    return alert(`${xhr.responseJSON.reason}: ${xhr.responseJSON.location} ${xhr.responseJSON.message}`)

};

function getAndDisplayInfo() {
    userLogOut();
    newExerStat();
    getUserStats(displayUserStats);
}

$(getAndDisplayInfo);
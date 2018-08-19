const authToken = JSON.parse(`${sessionStorage.getItem('authToken')}`);
const userToken = JSON.parse(`${sessionStorage.getItem('userToken')}`);
const username = sessionStorage.getItem('username');
const totalSteps = JSON.parse(`${sessionStorage.getItem('lifeSteps')}`);
const totalDistance = JSON.parse(`${sessionStorage.getItem('lifeDistance')}`);

let getuserStatsURL;
let userStatsURL;
let userLifeTimeURL;

function checkEnv() {
    
    let envHost = window.location.hostname;
    let envName = envHost.search('heroku');
    
    
    if (envName > 1) {
        console.log('envName > 1: ', envName > 1)
        
        getuserStatsURL = '/site/stats/';
        userStatsURL = '/site/';
        userLifeTimeURL = '/users/update/';
    }

    else {
        getuserStatsURL = 'http://localhost:8080/site/stats/';
        userStatsURL = 'http://localhost:8080/site/';
        userLifeTimeURL = 'http://localhost:8080/users/update/';
    };
};



function getUserStats() {
    //   setTimeout(function() {userBack(MOCK_USER_STATS)}, 1);
    if (authToken === null || userToken === null) {
        sessionStorage.clear();
        location.href = "../public"
    };

    let userStats = {
        async: true,
        crossDomain: true,
        url: `${getuserStatsURL}` + `${userToken}`,
        method: 'GET',
        headers: {        
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
            },
            error: function (xhr) { 
                errFunc(xhr)
                },
            success: function(response) {
            console.log('user stat success') 
        }
    }

    $.ajax(userStats).done(function(response) {
        console.log('user response: ', response)
        displayUserStats(response);
    })
    
}




function displayUserStats(data) {
    console.log('data: ', data)
    
    let userStatArray = data.userStats;
    
    $('.js-lifeStats').html(`
        <H2 class='boxTitle'>Lifetime stats:</h2>
        <ul class='topBullet'>
        <li><b>Lifetime Steps:</b> ${totalSteps}
        <li><b>Lifetime Distance:</b> ${totalDistance} miles
        </ul>`
        
    );
    
    $('.js-personStats').append(
        `<h2 class='boxTitle'>Recent Activity:</h2>`
    )
    
  
    console.log('userStatArray: ', userStatArray)
    
            if(userStatArray.length < 1 || userStatArray === null || userStatArray === undefined) {
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


        if(numSteps === null && distance === null) {
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
        else if(numSteps === null) {
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
        else if(distance === null) {
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


    $('.js-editStats').unbind().click(function() {
        
        //on the event prevent default behavior with no args
        //event.preventDefault();

        let clickedId = $(this).attr('id');

        console.log('edit id: ', clickedId)

        editGetStats(clickedId);

    })

    $('.js-delStats').unbind().click(function() {
        
        //on the event prevent default behavior with no args
        //event.preventDefault();

        let clickedId = $(this).attr('id');

        console.log('del id: ', clickedId)

        delGetStats(clickedId);

    })

}


function editGetStats(data) {

    let editID = data;


    let findStat = {
        async: true,
        crossDomain: true,
        url:  `${userStatsURL}` + `${editID}`,
        method: 'GET',
        headers: {        
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
            },
            error: function (xhr) { 
                errFunc(xhr)
                },
            success: function() {
        console.log('user stat retrieved') 
        }
    }

    $.ajax(findStat).done(function(response) {
        displayEditStats(response, editID);
    })


}


function displayEditStats(data, editID) {
    console.log('edit data: ', data)



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

function saveEditStats(exerDate, numSteps, distance, exertype, editID) {



    $('.js-editExerForm').unbind().submit(function(event) {

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


        if (newDistance == distance) {
            
            numStepsUpdate = parseFloat(newDistance) - parseFloat(distance)
            
            updateDistance = parseFloat(totalDistance) + parseFloat(numStepsUpdate);

        }

        if (newDistance > distance) {

            numStepsUpdate = parseFloat(newDistance) - parseFloat(distance)
            
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

        let editStats = {
            async: true,
            crossDomain: true,
            url: `${userStatsURL}` + `${editID}`,
            method: 'PUT',
            headers: {        
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`
                },
            processData: false,
            data: JSON.stringify({id: `${editID}`,date: `${newExerDate}`,steps: `${newNumSteps}`,distance: `${newDistance}`,exertype: `${newExertype}`}),
            error: function (xhr) { 
                errFunc(xhr)
                },
            success: function(response) {
                console.log('user stat updated')
                $('#closeEditModal')[0].click();
                updateLifeTimeInfo(updateSteps, updateDistance)

            }
        }

        console.log('editStats: ', editStats)
        $.ajax(editStats);
    })

}



function delGetStats(data) {

    let delID = data;


    let findStat = {
        async: true,
        crossDomain: true,
        url:  `${userStatsURL}` + `${delID}`,
        method: 'GET',
        headers: {        
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
            },
            error: function (xhr) { 
                errFunc(xhr)
                },
            success: function(response) {
                delStats(response);
        console.log('user stat retrieved') 
        }
    }

    $.ajax(findStat)
    
}

function delStats(response) {
    console.log('delStat data: ', response)


    delID = response.id;
    let numSteps = response.steps;
    let numDistance = response.distance;

    $('.js-delExerForm').unbind().submit(function(event) {
        
        
        event.preventDefault();

        let updateSteps = parseFloat(totalSteps) - parseFloat(numSteps);
        let updateDistance = parseFloat(totalDistance) - parseFloat(numDistance);
        
        let delStats = {
            async: true,
            crossDomain: true,
            url: `${userStatsURL}` + `${delID}`,
            method: 'DELETE',
            headers: {        
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`
                },
                error: function (xhr) { 
                    errFunc(xhr)
                    },
                success: function() {
                console.log('user stat removed')
                $('#closeDelModal')[0].click()
                updateLifeTimeInfo(updateSteps, updateDistance)
            }
        }
        
        $.ajax(delStats);
    })

}


function newExerStat() {

    $('.js-enterStatsForm').unbind().submit(function(event) {

        event.preventDefault();

        let addExerDate = $('#execDateEntry').val();
        let addNumSteps = $('#stepsField').val();
        let addDistance = $('#distanceField').val();
        let addExertype = $('#selectExerType').val();

        let updateSteps = parseFloat(totalSteps) + parseFloat(addNumSteps);

        let updateDistance = parseFloat(totalDistance) + parseFloat(addDistance);

        console.log('updateSteps: ', updateSteps)
        console.log('updateDistance: ', updateDistance)

        let newStats = {
            async: true,
            crossDomain: true,
            url: `${userStatsURL}`,
            method: 'POST',
            headers: {        
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`
                },
            processData: false,
            data: JSON.stringify({user: `${userToken}`,date: `${addExerDate}`,steps: `${addNumSteps}`,distance: `${addDistance}`,exertype: `${addExertype}`}),
            error: function (xhr) { 
                errFunc(xhr)
                },
            success: function(response) {
                console.log('user stat create')
                updateLifeTimeInfo(updateSteps, updateDistance)
            }
        }

        $.ajax(newStats);
    })

}


function updateLifeTimeInfo(updateSteps, updateDistance) {
    console.log('updateLifeTimeInfo start')

    let updateLifeTime = {

        async: true,
        crossDomain: true,
        url: `${userLifeTimeURL}` + `${userToken}`,
        method: 'PUT',
        headers: {        
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
            } ,
        processData: false,
        data: JSON.stringify({id: `${userToken}`,lifeSteps: `${updateSteps}`,lifeDistance: `${updateDistance}`}),
        error: function (xhr) { 
            errFunc(xhr)
            },
        success: function() {
            sessionStorage.setItem('lifeSteps', JSON.stringify(updateSteps))
            sessionStorage.setItem('lifeDistance', JSON.stringify(updateDistance))
            console.log('lifetime stats updated')
            location.reload(true);
        }
    }
    
    $.ajax(updateLifeTime);
    
};


function userLogOut() {
    $('.js-topNav').html(`
    <div class='navInfo'>
    <h1>Challenge Accepted</h1>
    <h2 class='userHello'>Hello ${username}!</h2>
    <a href='/ChallengeAccepted/public/' class='logoutLink js-logoutLink' id='logoutLink'>Logout</a>
    </div>
    `)

    $('#logoutLink').click(function(event) {
       // event.preventDefault();
        sessionStorage.clear();
    });

};

function errFunc(xhr) {
    return  alert(`${xhr.responseJSON.reason}: ${xhr.responseJSON.location} ${xhr.responseJSON.message}`)
  
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
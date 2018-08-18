const authToken = JSON.parse(`${sessionStorage.getItem('authToken')}`);
const userToken = JSON.parse(`${sessionStorage.getItem('userToken')}`);
const username = sessionStorage.getItem('username');
const totalSteps = JSON.parse(`${sessionStorage.getItem('lifeSteps')}`);
const totalDistance = JSON.parse(`${sessionStorage.getItem('lifeDistance')}`);


const getuserStatsURL = 'http://localhost:8080/site/stats/';
const userStatsURL = 'http://localhost:8080/site/';
const userLifeTimeURL = 'http://localhost:8080/users/update/';




function getUserStats() {
    //   setTimeout(function() {userBack(MOCK_USER_STATS)}, 1);
    if (authToken === null || userToken === null) {
        location.href = "/ChallengeAccepted/public"
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
        <p>Lifetime stats:</p>
        <ul>
        <li>Lifetime Steps: ${totalSteps}
        <li>Lifetime Distance: ${totalDistance}
        </ul>`
        
    );
    
    $('.js-personStats').append(
        '<p>Recent Activity:</p>'
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
                <ul>
                <li>Date: ${exerDate}
                <li>Activity: ${exertype}
                <li> <a href='#openEditModal' class='js-editStats' id='${statID}' onclick='(this)'>Edit</a> |
                    <a href='#openDelModal' class='js-delStats' id='${statID}' onclick='(this)'>Delete</a>
                </ul>`
            );

        }
        else if(numSteps === null) {
            $('.js-personStats').append(`
                <ul>
                <li>Date: ${exerDate}
                <li> Distance: ${distance} miles
                <li>Activity: ${exertype}
                <li> <a href='#openEditModal' class='js-editStats' id='${statID}' onclick='(this)'>Edit</a> |
                    <a href='#openDelModal' class='js-delStats' id='${statID}' onclick='(this)'>Delete</a>
                </ul>`
            );

        }
        else if(distance === null) {
            $('.js-personStats').append(`
                <ul>
                <li>Date: ${exerDate}
                <li> # Steps: ${numSteps}
                <li>Activity: ${exertype}
                <li> <a href='#openEditModal' class='js-editStats' id='${statID}' onclick='(this)'>Edit</a> |
                    <a href='#openDelModal' class='js-delStats' id='${statID}' onclick='(this)'>Delete</a>
                </ul>`
            );

        }
        else {
            $('.js-personStats').append(`
                <ul>
                <li>Date: ${exerDate}
                <li> # Steps: ${numSteps}
                <li> Distance: ${distance} miles
                <li>Activity: ${exertype}
                <li> <a href='#openEditModal' class='js-editStats' id='${statID}' onclick='(this)'>Edit</a> |
                    <a href='#openDelModal' class='js-delStats' id='${statID}' onclick='(this)'>Delete</a>
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

        delStats(clickedId);

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
            success: function(response) {
                console.log('user stat updated')
                $('#closeEditModal')[0].click();
            }
        }

        console.log('editStats: ', editStats)
        $.ajax(editStats);
    })

}

function delStats(data) {
    console.log('del data: ', data)

    let delID = data;

    $('.js-delExerForm').unbind().submit(function(event) {
        
        
        event.preventDefault();
        
        let delStats = {
            async: true,
            crossDomain: true,
            url: `${userStatsURL}` + `${delID}`,
            method: 'DELETE',
            headers: {        
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`
                },
            success: function(response) {
                console.log('user stat removed') 
                $('#closeDelModal')[0].click()
            }
        }

        $.ajax(delStats);

        
        //  $('#div').load('#div > *')
    })

}


function newExerStat() {

//exerDate, numSteps, distance, exertype, editID

/*
  
    execDateEntry
    selectExerType
    stepsField
    distanceField

*/

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
            success: function(response) {
                $.ajax(updateLifeTime);
                console.log('user stat create')
            }
        }

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
            success: function() {
                sessionStorage.setItem('lifeSteps', JSON.stringify(updateSteps))
                sessionStorage.setItem('lifeDistance', JSON.stringify(updateDistance))
                console.log('lifetime stats updated')
            }
        }

        console.log('newStats: ', newStats)
        $.ajax(newStats);
    })

}




function userLogOut() {
    $('.js-topNav').html(`
    <h1>Hello ${username}!</h1>
    <a href='/ChallengeAccepted/public/' class='logoutLink js-logoutLink' id='logoutLink'>Logout</a>
    `)

    $('#logoutLink').click(function(event) {
       // event.preventDefault();
        sessionStorage.clear();
    });

}

    
function getAndDisplayInfo() {
    userLogOut();
    newExerStat();
    getUserStats(displayUserStats);
           
    $('.js-bottomtemp').html(`
    <p>TEMP DATA:</p>
    <ul>
    <li>authToken: ${authToken}
    <li>userToken: ${userToken}
    <li>username: ${username}
    </ul>`
    );
    
}

    $(getAndDisplayInfo);
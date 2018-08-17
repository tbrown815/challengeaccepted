const authToken = JSON.parse(`${sessionStorage.getItem('authToken')}`);
const userToken = JSON.parse(`${sessionStorage.getItem('userToken')}`);

const getUserStatsURL = 'http://localhost:8080/site/stats/';
const delUserStatsURL = 'http://localhost:8080/site/';

let MOCK_USER_STATS = {
    "userStats": [

        {
            "date": "05-24-2018",
            "steps": "12535",
            "distance": "4.1",
            "duration": "94",
            "exType": "walk"
        },
        {
            "date": "05-25-2018",
            "steps": "4532",
            "distance": "1.9",
            "duration": "24",
            "exType": "run"
        },
        {
            "date": "05-26-2018",
            "steps": "3423",
            "distance": "1.2",
            "duration": "15",
            "exType": "walk"
        }
    ]
};



let totalSteps = 0;
let totalDistance = 0;


function getUserStats() {
 //   setTimeout(function() {userBack(MOCK_USER_STATS)}, 1);

    let userStats = {
        async: true,
        crossDomain: true,
        url: `${getUserStatsURL}` + `${userToken}`,
        method: 'GET',
        headers: {Authorization: `Bearer ${authToken}`},
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
    //console.log('data.userStats.length: ', data.userStats.length)

    let userStatArray = data.userStats;

    for (let i=0; i<userStatArray.length; i++) {

        
        totalSteps = totalSteps + parseInt(data.userStats[i].steps)
        totalDistance = totalDistance + parseInt(data.userStats[i].distance)
    }
        
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

        //$('.js-formSteps').val(numSteps);


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

        editStats(clickedId);

    })

    $('.js-delStats').unbind().click(function() {
        
        //on the event prevent default behavior with no args
        //event.preventDefault();

        let clickedId = $(this).attr('id');

        console.log('del id: ', clickedId)

        delStats(clickedId);

    })

}


function editStats(data) {
    console.log('edit data: ', data)

}

function delStats(data) {
    console.log('del data: ', data)

    let delID = data;

    $('.js-delExerForm').unbind().submit(function(event) {
        
        
        event.preventDefault();
        
        let delStats = {
            async: true,
            crossDomain: true,
            url: `${delUserStatsURL}` + `${delID}`,
            method: 'DELETE',
            headers: {Authorization: `Bearer ${authToken}`},
            success: function(response) {
                    console.log('user stat removed') 
                    $('#closeDelModal')[0].click()
            }
        }

        $.ajax(delStats);

        
        //  $('#div').load('#div > *')
    })

}

    
function getAndDisplayInfo() {
    getUserStats(displayUserStats);
           
    $('.js-bottomtemp').html(`
    <p>TEMP DATA:</p>
    <ul>
    <li>authToken: ${authToken}
    <li>userToken: ${userToken}
    </ul>`
    );
    
}

    $(getAndDisplayInfo);
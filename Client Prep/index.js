

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

let MOCK_CHALL_STATS = {
    "challStats": [

        {
            "challName": "10 mile mahem",
            "user": "aabbccdd",
            "distance": "4.1"
        },
        {
            "challName": "10 mile mahem",
            "user": "eeffgg",
            "distance": "1.9"
        },
        {
            "challName": "10 mile mahem",
            "user": "hhiijj",
            "distance": "2.9"
        }
    ]
};

let MOCK_CHALL_AVAIL = {
    "challAvail": [

        {
            "startDate": "08-24-2018",
            "challName": "15000 Step 2 day shuffle",
            "challType": "steps",
            "challenge": "15000",
            "duration": "2"
        },
        {
            "startDate": "08-10-2018",
            "challName": "20 Mile four day jam!",
            "challType": "miles",
            "challenge": "20",
            "duration": "4"


        }
    ]
};


let totalSteps = 0;
let totalDistance = 0;


function getUserStats(userBack) {
    setTimeout(function() {userBack(MOCK_USER_STATS)}, 1);

}




function displayUserStats(data) {
console.log('data.userStats.length: ', data.userStats.length)

    let userStatArray = data.userStats;

    for (let i=0; i<userStatArray.length; i++) {

        
        totalSteps = totalSteps + parseInt(data.userStats[i].steps)
        totalDistance = totalDistance + parseInt(data.userStats[i].distance)
    }
        
        $('.js-personStats').html(`
        <p>Lifetime stats:</p>
        <ul>
        <li>Lifetime Steps: ${totalSteps}
        <li>Lifetime Distance: ${totalDistance}
        </ul>`
        
    );
    
    $('.js-personStats').append(
        '<p>Recent stats:</p>'
    )

    for (index in data.userStats) {

        $('.js-personStats').append(
            '<ul>' +
                '<li>' + 'Date: ' + data.userStats[index].date +
                '<li>' + 'Total # Steps: ' + data.userStats[index].steps +
                '<li>' + 'Total Distance: ' + data.userStats[index].distance
            + '</ul>'
        );
    }
}




function getChallStats(challBack) {
    setTimeout(function() {challBack(MOCK_CHALL_STATS)}, 1);

}




function displayChallStats(data) {
    $('.js-challengeRank').append(
        '<p>Challenge stats:</p>'
    );

  for (index in data.challStats) {
    $('.js-challengeRank').append(
            '<ul>' +
            '<li>' + 'Challenge Name:' + data.challStats[index].challName +
            '<li>' + 'Users:' + data.challStats[index].user +
            '<li>' + 'Total Distance:' + data.challStats[index].distance
            + '</ul>'
        );
    }
}



function getAvailChall(availBack) {
    setTimeout(function() {availBack(MOCK_CHALL_AVAIL)}, 1);

}


function displayAvailChall(data) {

    $('.js-challengeSelect').append(
        '<p>Available Challenges:</p>'
    );
    for (index in data.challAvail) {
        $('.js-challengeSelect').append(
                '<ul>' + 
                '<li>' + data.challAvail[index].challName + '</li>' +
                    '<ul>' +
                    '<li>' + data.challAvail[index].startDate + '</li>' +
                    '<li>' + data.challAvail[index].challenge + ' ' + data.challAvail[index].challType + '</li>' +
                    '<li>' + data.challAvail[index].duration + 'days' + '</li>' +
                    '<li>' + '|Join Now|'
                    + '</ul>'
                + '</ul>'
        );
    }
}


    
function getAndDisplayInfo() {
    getUserStats(displayUserStats);
    getChallStats(displayChallStats);
    getAvailChall(displayAvailChall);
}

    $(getAndDisplayInfo);
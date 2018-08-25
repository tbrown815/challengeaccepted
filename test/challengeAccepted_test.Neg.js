'use strict';

const chai = require('chai');

const chaiHttp = require('chai-http');

const faker = require('faker');

const mongoose = require('mongoose');

const expect = chai.expect;

const { exerStatsModel, userInfoModel } = require('../models')

const { app, startServer, stopServer } = require('../server');

const config = require('../config');

let userData;

let statData;

let testToken;

chai.use(chaiHttp);


//Create test data for User Collection
function populateTestData() {
    console.info('test user data is being created');
    const testData = [];

    for (let i = 0; i < 10; i++) {
        testData.push(generateData());

        userData = testData[0];

        return userInfoModel.insertMany(testData);
    }
};

function generateData() {

    const id = require('mongoose').Types.ObjectId();

    return {
        _id: id,
        username: faker.internet.userName(),
        password: faker.internet.password(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        lifeSteps: faker.random.number(),
        lifeDistance: faker.random.number()
    }
};

//Create test data for Stat Collection
function populateTestStatData() {
    console.info('test stat data is being created');
    const testStatData = [];

    for (let i = 0; i < 10; i++) {
        testStatData.push(genUserStats());

        statData = testStatData[0];

        return exerStatsModel.insertMany(testStatData);
    }
};

function genUserStats() {

    const id = require('mongoose').Types.ObjectId();

    return {
        _id: id,
        user: userData._id,
        date: faker.date.recent(),
        steps: faker.random.number(),
        distance: faker.random.number(),
        exertype: selectExerType()

    }
};

function selectExerType() {

    let exertype;


    function randomNum(num) {
        return Math.floor(Math.random() * Math.floor(num));
    }

    if (randomNum = 0) {
        exertype = 'walk';
    }
    else {
        exertype = 'run';
    }

    return exertype;
};


function genJWT() {

    const jwt = require('jsonwebtoken');

    const username = userData.username;
    const password = userData.password;

    let user = { username: username, password: password };

    let token = jwt.sign(
        {
            user: {
                username,
                password
            }
        },
        config.JWT_SECRET,
        {
            subject: user.username,
            expiresIn: config.JWT_EXPIRE,
            algorithm: 'HS256'
        }
    );

    testToken = token;
};




function resetDB() {
    console.warn('DB will be deleted and reset');
    return mongoose.connection.dropDatabase();
};

describe('Test Resources', function () {

    //BEFORE - RUNS TO START SERVER
    before(function () {
        return startServer(config.TEST_DATABASE_URL);
    });

    beforeEach(function () {
        return populateTestData();
    });

    beforeEach(function () {
        return populateTestStatData();
    })

    beforeEach(function () {
        return genJWT();
    })

    afterEach(function () {
        return resetDB();
    });

    after(function () {
        return stopServer();
    });



    //USER TESTS
    describe('USERS TEST SET', function () {


        it('GET JWT and request user info with bad userid, expect 500', function () {
            const dbID = userData._id + 'xy';

            return chai.request(app)
                .get(`/users/${dbID}`)
                .set('Authorization', `Bearer ${testToken}`)
                .then(function (res) {

                    expect(res).to.have.status(500);
                    expect(res).to.be.a('object');
                    expect(res.body).to.not.have.all.keys('id', 'username', 'firstName', 'lastName', 'email', 'lifeSteps', 'lifeDistance')
                    expect(res.body).to.have.all.keys('code', 'reason', 'location', 'message')
                    expect(res.body.reason).to.have.string('ERROR');
                    expect(res.body.message).to.have.string('unable to find id');
                })

        })

        it('GET JWT and request user info with null userid, expect 500', function () {
            const dbID = null;

            return chai.request(app)
                .get(`/users/${dbID}`)
                .set('Authorization', `Bearer ${testToken}`)
                .then(function (res) {

                    expect(res).to.have.status(500);
                    expect(res).to.be.a('object');
                    expect(res.body).to.not.have.all.keys('id', 'username', 'firstName', 'lastName', 'email', 'lifeSteps', 'lifeDistance')
                    expect(res.body).to.have.all.keys('code', 'reason', 'location', 'message')
                    expect(res.body.reason).to.have.string('ERROR');
                    expect(res.body.message).to.have.string('unable to find id');
                })

        })


        it('GET JWT and request user info with bad token, expect 401', function () {
            const dbID = userData._id;
            const badToken = `123${testToken}456`

            return chai.request(app)
                .get(`/users/${dbID}`)
                .set('Authorization', `Bearer ${badToken}`)
                .then(function (res) {

                    expect(res).to.have.status(401);
                    expect(res.responseText).to.be.undefined;
                    expect(res.body).to.not.have.all.keys('id', 'username', 'firstName', 'lastName', 'email', 'lifeSteps', 'lifeDistance')

                })

        })

        it('GET userToken and user lifestat info with bad username, expect 500', function () {
            const username = `${userData.username}abc`;

            return chai.request(app)
                .get(`/users/getuser/${username}`)
                .set('Authorization', `Bearer ${testToken}`)
                .then(function (res) {

                    expect(res).to.have.status(500);
                    expect(res).to.be.a('object');
                    expect(res.body).to.not.have.all.keys('id', 'lifeSteps', 'lifeDistance')
                    expect(res.body).to.have.all.keys('code', 'reason', 'location', 'message')
                    expect(res.body.reason).to.have.string('ERROR');
                    expect(res.body.message).to.have.string('unable to find user');

                })

        })

        it('GET userToken and user lifestat info with null username, expect 500', function () {
            const username = null;
            const badToken = `123${testToken}456`

            return chai.request(app)
                .get(`/users/getuser/${username}`)
                .set('Authorization', `Bearer ${testToken}`)
                .then(function (res) {

                    expect(res).to.have.status(500);
                    expect(res).to.be.a('object');
                    expect(res.body).to.not.have.all.keys('id', 'lifeSteps', 'lifeDistance')
                    expect(res.body).to.have.all.keys('code', 'reason', 'location', 'message')
                    expect(res.body.reason).to.have.string('ERROR');
                    expect(res.body.message).to.have.string('unable to find user');
                })

        })

        describe('CREATE USER TEST SET', function () {

            it('Will POST data to create new user, username too short', function () {

                const genData = generateData();

                genData.lifeSteps = 0;
                genData.lifeDistance = 0;

                let badUser = {
                    username: 'toshort',
                    password: genData.password,
                    firstName: genData.firstName,
                    lastName: genData.lastName,
                    email: genData.email,
                    lifeSteps: genData.lifeSteps,
                    lifeDistance: genData.lifeDistance
                }

                return chai.request(app)

                    .post('/users')

                    .send(badUser)

                    .then(function (res) {

                        expect(res).to.have.status(422);
                        expect(res).to.be.json;
                        expect(res).to.be.a('object');
                        expect(res.body).to.not.have.all.keys('id', 'username', 'firstName', 'lastName', 'email', 'lifeSteps', 'lifeDistance')
                        expect(res.body.reason).to.have.string('ERROR');
                        expect(res.body.message).to.have.string('is required to be at least 8 characters long');
                        expect(res.body.location).to.have.string('username');

                    })

            })

            it('Will POST data to create new user, password too short', function () {

                const genData = generateData();

                genData.lifeSteps = 0;
                genData.lifeDistance = 0;

                let badUser = {
                    username: genData.username,
                    password: 'toshort',
                    firstName: genData.firstName,
                    lastName: genData.lastName,
                    email: genData.email,
                    lifeSteps: genData.lifeSteps,
                    lifeDistance: genData.lifeDistance
                }

                return chai.request(app)

                    .post('/users')

                    .send(badUser)

                    .then(function (res) {

                        expect(res).to.have.status(422);
                        expect(res).to.be.json;
                        expect(res).to.be.a('object');
                        expect(res.body).to.not.have.all.keys('id', 'username', 'firstName', 'lastName', 'email', 'lifeSteps', 'lifeDistance')
                        expect(res.body.reason).to.have.string('ERROR');
                        expect(res.body.message).to.have.string('is required to be at least 8 characters long');
                    })

            })

            it('Will POST data to create new user, firstname undefined', function () {

                const genData = generateData();

                genData.lifeSteps = 0;
                genData.lifeDistance = 0;

                let badUser = {
                    username: genData.username,
                    password: genData.password,
                    firstName: undefined,
                    lastName: genData.lastName,
                    email: genData.email,
                    lifeSteps: genData.lifeSteps,
                    lifeDistance: genData.lifeDistance
                }

                return chai.request(app)

                    .post('/users')

                    .send(badUser)

                    .then(function (res) {

                        expect(res).to.have.status(500);
                        expect(res).to.be.json;
                        expect(res).to.be.a('object');
                        expect(res.body).to.not.have.all.keys('id', 'username', 'firstName', 'lastName', 'email', 'lifeSteps', 'lifeDistance')
                        expect(res.body.reason).to.have.string('ERROR');
                        expect(res.body.message).to.have.string('Field is not present');
                        expect(res.body.location).to.have.string('firstName');

                    })

            })

            it('Will POST data to create new user, lastname undefined', function () {

                const genData = generateData();

                genData.lifeSteps = 0;
                genData.lifeDistance = 0;

                let badUser = {
                    username: genData.username,
                    password: genData.password,
                    firstName: genData.firstName,
                    lastName: undefined,
                    email: genData.email,
                    lifeSteps: genData.lifeSteps,
                    lifeDistance: genData.lifeDistance
                }

                return chai.request(app)

                    .post('/users')

                    .send(badUser)

                    .then(function (res) {

                        expect(res).to.have.status(500);
                        expect(res).to.be.json;
                        expect(res).to.be.a('object');
                        expect(res.body).to.not.have.all.keys('id', 'username', 'firstName', 'lastName', 'email', 'lifeSteps', 'lifeDistance')
                        expect(res.body.reason).to.have.string('ERROR');
                        expect(res.body.message).to.have.string('Field is not present');
                        expect(res.body.location).to.have.string('lastName');

                    })

            })

            it('Will POST data to create new user, email undefined', function () {

                const genData = generateData();

                genData.lifeSteps = 0;
                genData.lifeDistance = 0;

                let badUser = {
                    username: genData.username,
                    password: genData.password,
                    firstName: genData.firstName,
                    lastName: genData.lastName,
                    email: undefined,
                    lifeSteps: genData.lifeSteps,
                    lifeDistance: genData.lifeDistance
                }

                return chai.request(app)

                    .post('/users')

                    .send(badUser)

                    .then(function (res) {

                        expect(res).to.have.status(500);
                        expect(res).to.be.json;
                        expect(res).to.be.a('object');
                        expect(res.body).to.not.have.all.keys('id', 'username', 'firstName', 'lastName', 'email', 'lifeSteps', 'lifeDistance')
                        expect(res.body.reason).to.have.string('ERROR');
                        expect(res.body.message).to.have.string('Field is not present');
                        expect(res.body.location).to.have.string('email');

                    })

            })

        });

        //USERS TEST BLOCK END
    });


    // STATS TEST BLOCK

    describe('STATS TEST SET', function () {


        it('post new stats with bad authToken, return 401', function () {

            const username = userData.username;


            return chai.request(app)
                .get(`/users/getuser/${username}`)
                .set('Authorization', `Bearer ${testToken}`)
                .then(function (res) {

                    expect(res).to.have.status(200);
                    expect(res).to.be.a('object');
                    expect(res.body.id).to.have.lengthOf.at.least(1);
                    expect(res.body.id).to.be.a('string');

                    let dbID = res.body.id;

                    return dbID;

                }).then(function (dbID) {

                    const badToken = `123${testToken}456`

                    const user = dbID;
                    const exerDate = faker.date.recent();
                    const steps = faker.random.number();
                    const distance = faker.random.number();
                    let exertype;

                    function randomNum(num) {
                        return Math.floor(Math.random() * Math.floor(num));
                    }

                    if (randomNum = 0) {
                        exertype = 'run';
                    }
                    else {
                        exertype = 'walk';
                    }

                    const userVal = { "user": `${user}`, "date": `${exerDate}`, "steps": `${steps}`, "distance": `${distance}`, "exertype": `${exertype}` }

                    return chai.request(app)
                        .post(`/site/`)
                        .set('Authorization', `Bearer ${badToken}`)
                        .set('Content-Type', 'application/json')
                        .send(userVal)

                        .then(function (res) {

                            expect(res).to.have.status(401);
                            expect(res.responseText).to.be.undefined;
                            expect(res.body).to.not.have.all.keys('id', 'user', 'date', 'steps', 'distance', 'exertype')

                        })

                })

        })


        it('post new stats with bad usertoken, return 500', function () {

            const username = userData.username;


            return chai.request(app)
                .get(`/users/getuser/${username}`)
                .set('Authorization', `Bearer ${testToken}`)
                .then(function (res) {

                    expect(res).to.have.status(200);
                    expect(res).to.be.a('object');
                    expect(res.body.id).to.have.lengthOf.at.least(1);
                    expect(res.body.id).to.be.a('string');

                    let dbID = res.body.id;

                    return dbID;

                }).then(function (dbID) {

                    const badToken = `123${dbID}456`

                    const user = badToken;
                    const exerDate = faker.date.recent();
                    const steps = faker.random.number();
                    const distance = faker.random.number();
                    let exertype;

                    function randomNum(num) {
                        return Math.floor(Math.random() * Math.floor(num));
                    }

                    if (randomNum = 0) {
                        exertype = 'run';
                    }
                    else {
                        exertype = 'walk';
                    }

                    const userVal = { "user": `${user}`, "date": `${exerDate}`, "steps": `${steps}`, "distance": `${distance}`, "exertype": `${exertype}` }

                    return chai.request(app)
                        .post(`/site/`)
                        .set('Authorization', `Bearer ${testToken}`)
                        .set('Content-Type', 'application/json')
                        .send(userVal)

                        .then(function (res) {

                            expect(res).to.have.status(500);
                            expect(res.body).to.not.have.all.keys('id', 'user', 'date', 'steps', 'distance', 'exertype')
                            expect(res.body.reason).to.have.string('ERROR');
                            expect(res.body.message).to.have.string('unable to post data');
                            expect(res.body.location).to.have.string('');

                        })

                })

        })


        it('post new stats with empty exerDate, return 500', function () {

            const username = userData.username;


            return chai.request(app)
                .get(`/users/getuser/${username}`)
                .set('Authorization', `Bearer ${testToken}`)
                .then(function (res) {

                    expect(res).to.have.status(200);
                    expect(res).to.be.a('object');
                    expect(res.body.id).to.have.lengthOf.at.least(1);
                    expect(res.body.id).to.be.a('string');

                    let dbID = res.body.id;
                    return dbID;

                }).then(function (dbID) {

                    const user = dbID;
                    const exerDate = undefined;
                    const steps = faker.random.number();
                    const distance = faker.random.number();
                    let exertype;

                    function randomNum(num) {
                        return Math.floor(Math.random() * Math.floor(num));
                    }

                    if (randomNum = 0) {
                        exertype = 'run';
                    }
                    else {
                        exertype = 'walk';
                    }

                    const userVal = { "user": `${user}`, "date": `${exerDate}`, "steps": `${steps}`, "distance": `${distance}`, "exertype": `${exertype}` }

                    return chai.request(app)
                        .post(`/site/`)
                        .set('Authorization', `Bearer ${testToken}`)
                        .set('Content-Type', 'application/json')
                        .send(userVal)

                        .then(function (res) {

                            expect(res).to.have.status(500);
                            expect(res.body).to.not.have.all.keys('id', 'user', 'date', 'steps', 'distance', 'exertype')
                            expect(res.body.reason).to.have.string('ERROR');
                            expect(res.body.message).to.have.string('something went wrong');
                            expect(res.body.location).to.have.string('');

                        })

                })

        })


        it('post new stats with empty steps, return 500', function () {

            const username = userData.username;


            return chai.request(app)
                .get(`/users/getuser/${username}`)
                .set('Authorization', `Bearer ${testToken}`)
                .then(function (res) {

                    expect(res).to.have.status(200);
                    expect(res).to.be.a('object');
                    expect(res.body.id).to.have.lengthOf.at.least(1);
                    expect(res.body.id).to.be.a('string');

                    let dbID = res.body.id;

                    return dbID;

                }).then(function (dbID) {

                    const user = dbID;
                    const exerDate = faker.date.recent();;
                    const steps = undefined;
                    const distance = faker.random.number();
                    let exertype;

                    function randomNum(num) {
                        return Math.floor(Math.random() * Math.floor(num));
                    }

                    if (randomNum = 0) {
                        exertype = 'run';
                    }
                    else {
                        exertype = 'walk';
                    }

                    const userVal = { "user": `${user}`, "date": `${exerDate}`, "steps": `${steps}`, "distance": `${distance}`, "exertype": `${exertype}` }

                    return chai.request(app)
                        .post(`/site/`)
                        .set('Authorization', `Bearer ${testToken}`)
                        .set('Content-Type', 'application/json')
                        .send(userVal)

                        .then(function (res) {

                            expect(res).to.have.status(500);
                            expect(res.body).to.not.have.all.keys('id', 'user', 'date', 'steps', 'distance', 'exertype')
                            expect(res.body.reason).to.have.string('ERROR');
                            expect(res.body.message).to.have.string('something went wrong');
                            expect(res.body.location).to.have.string('');

                        })

                })

        })


        it('post new stats with empty distance, return 500', function () {

            const username = userData.username;


            return chai.request(app)
                .get(`/users/getuser/${username}`)
                .set('Authorization', `Bearer ${testToken}`)
                .then(function (res) {

                    expect(res).to.have.status(200);
                    expect(res).to.be.a('object');
                    expect(res.body.id).to.have.lengthOf.at.least(1);
                    expect(res.body.id).to.be.a('string');

                    let dbID = res.body.id;

                    return dbID;

                }).then(function (dbID) {

                    const user = dbID;
                    const exerDate = faker.date.recent();;
                    const steps = faker.random.number();
                    const distance = undefined;
                    let exertype;

                    function randomNum(num) {
                        return Math.floor(Math.random() * Math.floor(num));
                    }

                    if (randomNum = 0) {
                        exertype = 'run';
                    }
                    else {
                        exertype = 'walk';
                    }

                    const userVal = { "user": `${user}`, "date": `${exerDate}`, "steps": `${steps}`, "distance": `${distance}`, "exertype": `${exertype}` }

                    return chai.request(app)
                        .post(`/site/`)
                        .set('Authorization', `Bearer ${testToken}`)
                        .set('Content-Type', 'application/json')
                        .send(userVal)

                        .then(function (res) {

                            expect(res).to.have.status(500);
                            expect(res.body).to.not.have.all.keys('id', 'user', 'date', 'steps', 'distance', 'exertype')
                            expect(res.body.reason).to.have.string('ERROR');
                            expect(res.body.message).to.have.string('something went wrong');
                            expect(res.body.location).to.have.string('');

                        })

                })

        })


        it('post new stats with empty exerType, return 201', function () {

            const username = userData.username;


            return chai.request(app)
                .get(`/users/getuser/${username}`)
                .set('Authorization', `Bearer ${testToken}`)
                .then(function (res) {

                    expect(res).to.have.status(200);
                    expect(res).to.be.a('object');
                    expect(res.body.id).to.have.lengthOf.at.least(1);
                    expect(res.body.id).to.be.a('string');

                    let dbID = res.body.id;

                    return dbID;

                }).then(function (dbID) {

                    const user = dbID;
                    const exerDate = faker.date.recent();;
                    const steps = faker.random.number();
                    const distance = faker.random.number();
                    let exertype = undefined;


                    const userVal = { "user": `${user}`, "date": `${exerDate}`, "steps": `${steps}`, "distance": `${distance}`, "exertype": `${exertype}` }

                    return chai.request(app)
                        .post(`/site/`)
                        .set('Authorization', `Bearer ${testToken}`)
                        .set('Content-Type', 'application/json')
                        .send(userVal)

                        .then(function (res) {

                            expect(res).to.have.status(201);
                            expect(res).to.be.a('object');
                            expect(res.body).to.have.all.keys('id', 'user', 'date', 'steps', 'distance', 'exertype')
                            expect(res.body.id).to.have.lengthOf.at.least(1);
                            expect(res.body.id).to.be.a('string');
                            expect(res.body.user).to.have.lengthOf.at.least(1);
                            expect(res.body.user).to.be.a('string');
                            expect(res.body.date).to.have.lengthOf.at.least(1);
                            expect(res.body.date).to.be.a('string');
                            expect(res.body.steps).to.be.a('number');
                            expect(res.body.distance).to.be.a('number');
                        })

                })

        })







        it('request user stats using bad user token', function () {

            const dbID = userData._id + 'xy';

            return chai.request(app)
                .get(`/site/stats/${dbID}`)
                .set('Authorization', `Bearer ${testToken}`)
                .then(function (res) {

                    expect(res).to.have.status(500);
                    expect(res).to.be.a('object');
                    expect(res.body).to.not.have.all.keys('id', 'user', 'date', 'steps', 'distance', 'exertype')
                    expect(res.body.reason).to.have.string('ERROR');
                    expect(res.body.message).to.have.string('unable to find id');
                    expect(res.body.location).to.have.string('');

                })

        })

        it('request user stats with no user token', function () {

            return chai.request(app)
                .get(`/site/stats/`)
                .set('Authorization', `Bearer ${testToken}`)
                .then(function (res) {

                    expect(res).to.have.status(500);
                    expect(res).to.be.a('object');
                    expect(res.body).to.not.have.all.keys('id', 'user', 'date', 'steps', 'distance', 'exertype')
                    expect(res.body.reason).to.have.string('ERROR');
                    expect(res.body.message).to.have.string('unable to find id');
                    expect(res.body.location).to.have.string('');

                })

        })


        it('delete user stat document with, then verify message recieved on second attempt', function () {

            const dbID = statData._id;

            return chai.request(app)
                .delete(`/site/${dbID}`)
                .set('Authorization', `Bearer ${testToken}`)
                .then(function (res) {

                    expect(res).to.have.status(200);
                    expect(res.body).to.have.all.keys('code', 'reason', 'location', 'message')
                    expect(res.body.reason).to.have.string('SUCCESS');
                    expect(res.body.message).to.have.string('User record has been removed');
                }).then(function () {

                    return chai.request(app)
                        .delete(`/site/${dbID}`)
                        .set('Authorization', `Bearer ${testToken}`)
                        .send({ "id": "" })
                        .then(function (res) {

                            expect(res).to.have.status(422);
                            expect(res.body).to.have.all.keys('code', 'reason', 'location', 'message')
                            expect(res.body.reason).to.have.string('ERROR');
                            expect(res.body.location).to.have.string('ID');
                            expect(res.body.message).to.have.string('User record does not exist');
                        })
                })

        })


        it('delete user stat document with missing stat id', function () {

            return chai.request(app)
                .delete(`/site/`)
                .set('Authorization', `Bearer ${testToken}`)
                .send({ "id": "" })
                .then(function (res) {

                    expect(res).to.have.status(404);
                    expect(res.body).to.have.string('There was an error, please try again - EP does not exist');
                })


        })

        it('update all stats with empty id, expect 422', function () {

            const dbID = statData._id;

            let newVal = {
                id: '',
                date: faker.date.recent(),
                steps: faker.random.number(),
                distance: faker.random.number(),
                exertype: selectExerType()
            };

            return chai.request(app)
                .put(`/site/${dbID}`)
                .set('Authorization', `Bearer ${testToken}`)
                .set('Content-Type', 'application/json')
                .send(newVal)
                .then(function (res) {

                    expect(res).to.have.status(422);
                    expect(res.text).to.have.string('req.params.id and req.body.id must match');

                })

        });


        it('update all stats with no id, expect 422', function () {

            const dbID = statData._id;

            let newVal = {
                date: faker.date.recent(),
                steps: faker.random.number(),
                distance: faker.random.number(),
                exertype: selectExerType()
            };

            return chai.request(app)
                .put(`/site/${dbID}`)
                .set('Authorization', `Bearer ${testToken}`)
                .set('Content-Type', 'application/json')
                .send(newVal)
                .then(function (res) {

                    expect(res).to.have.status(422);
                    expect(res.body).to.have.all.keys('code', 'reason', 'location', 'message')
                    expect(res.body.reason).to.have.string('ERROR');
                    expect(res.body.location).to.have.string('id');
                    expect(res.body.message).to.have.string('Field is not present');

                })

        });


        it('update lifetime stats with empty id, expect 422', function () {

            const dbID = statData._id;

            let newVal = {
                id: ``,
                lifeSteps: faker.random.number(),
                lifeDistance: faker.random.number()

            };

            return chai.request(app)
                .put(`/site/${dbID}`)
                .set('Authorization', `Bearer ${testToken}`)
                .set('Content-Type', 'application/json')
                .send(newVal)
                .then(function (res) {

                    expect(res).to.have.status(422);
                    expect(res.text).to.have.string('req.params.id and req.body.id must match');

                })

        });


        it('update lifetime stats with missing id, expect 422', function () {


            const dbID = statData._id;

            let newVal = {
                lifeSteps: faker.random.number(),
                lifeDistance: faker.random.number()

            };

            return chai.request(app)
                .put(`/site/${dbID}`)
                .set('Authorization', `Bearer ${testToken}`)
                .set('Content-Type', 'application/json')
                .send(newVal)
                .then(function (res) {

                    expect(res).to.have.status(422);
                    expect(res.body).to.have.all.keys('code', 'reason', 'location', 'message')
                    expect(res.body.reason).to.have.string('ERROR');
                    expect(res.body.location).to.have.string('id');
                    expect(res.body.message).to.have.string('Field is not present');

                })

        });


        // END STATS TEST BLOCK
    })


    //TEST RESOURCES END
});
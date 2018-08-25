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


    //HTML CHECK TESTS
    describe('HTML TEST SET', function () {

        it('public should return typeof html and status 200', function () {
            return chai.request(app)
                .get('/users/')
                .set('authorization', `Bearer ${testToken}`)
                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                })
        })
    })


    //STATIC PAGE CHECKS
    describe('HTML TEST SET', function () {

        it('public should return typeof html and status 200', function () {
            return chai.request(app)
                .get('/clientSite/')
                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.html;
                })
        })


        it('clientSite should return typeof html and status 200', function () {
            return chai.request(app)
                .get('/clientSite/')
                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.html;
                })
        })
    });

    //USER TESTS
    describe('USERS TEST SET', function () {

        it('GET DB objects, validate count and json/200 resp', function () {

            let res;

            return chai.request(app)
                .get('/users')
                .then(function (_res) {
                    res = _res;

                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body.users).to.have.lengthOf.at.least(1);
                    return userInfoModel.count();
                })

                .then(function (count) {
                    expect(res.body.users).to.have.lengthOf(count);
                })
        });

        it('GET DB objects and verify expected keys present', function () {
            let respUsers = [];
            let recordCount = userInfoModel.count();

            return chai.request(app)
                .get('/users')

                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body.users).to.have.lengthOf.at.least(1);

                    res.body.users.forEach(function (user) {
                        expect(user).to.be.a('object');
                        expect(user).to.include.keys('id', 'username', 'firstName', 'lastName', 'email', 'lifeSteps', 'lifeDistance');
                    })

                    respUsers = res.body.users[0];
                    return userInfoModel.findById(respUsers.id)

                })

                .then(function (user) {
                    expect(respUsers.id).to.be.equal(user.id);
                    expect(respUsers.username).to.be.equal(user.username);
                    expect(respUsers.firstName).to.be.equal(user.firstName);
                    expect(respUsers.lastName).to.be.equal(user.lastName);
                    expect(respUsers.email).to.be.equal(user.email);
                    expect(respUsers.lifeSteps).to.be.equal(user.lifeSteps);
                    expect(respUsers.lifeDistance).to.be.equal(user.lifeDistance);

                })
        })



        it('GET JWT and request user info', function () {
            const id = userData._id;

            return chai.request(app)
                .get(`/users/${id}`)
                .set('Authorization', `Bearer ${testToken}`)
                .then(function (res) {

                    expect(res).to.have.status(200);
                    expect(res).to.be.a('object');
                    expect(res.body).to.have.all.keys('id', 'username', 'firstName', 'lastName', 'email', 'lifeSteps', 'lifeDistance')
                    expect(res.body.id).to.have.lengthOf.at.least(1);
                    expect(res.body.id).to.be.a('string');
                    expect(res.body.username).to.have.lengthOf.at.least(1);
                    expect(res.body.username).to.be.a('string');
                    expect(res.body.firstName).to.have.lengthOf.at.least(1);
                    expect(res.body.firstName).to.be.a('string');
                    expect(res.body.lastName).to.have.lengthOf.at.least(1);
                    expect(res.body.lastName).to.be.a('string');
                    expect(res.body.email).to.have.lengthOf.at.least(1);
                    expect(res.body.email).to.be.a('string');
                    expect(res.body.email).to.have.string('@');
                    expect(res.body.email).to.have.string('.');
                    expect(res.body.lifeSteps).to.be.a('number');
                    expect(res.body.lifeDistance).to.be.a('number');
                })

        })

        it('GET userToken and user lifestat info', function () {
            const username = userData.username;

            return chai.request(app)
                .get(`/users/getuser/${username}`)
                .set('Authorization', `Bearer ${testToken}`)
                .then(function (res) {

                    expect(res).to.have.status(200);
                    expect(res).to.be.a('object');
                    expect(res.body).to.have.all.keys('id', 'lifeSteps', 'lifeDistance')
                    expect(res.body.id).to.have.lengthOf.at.least(1);
                    expect(res.body.id).to.be.a('string');
                    expect(res.body.lifeSteps).to.be.a('number');
                    expect(res.body.lifeDistance).to.be.a('number');


                })

        })


        describe('CREATE USER TEST SET', function () {

            it('Will POST data to create new user', function () {

                const genData = generateData();

                genData.lifeSteps = 0;
                genData.lifeDistance = 0;

                return chai.request(app)

                    .post('/users')

                    .send(genData)

                    .then(function (res) {
                        expect(res).to.have.status(201);
                        expect(res).to.be.json;
                        expect(res).to.be.a('object');

                        expect(res.body).to.include.keys('id', 'username', 'firstName', 'lastName', 'email', 'lifeSteps', 'lifeDistance');
                        expect(res.body.username).to.contain(genData.username);
                        expect(res.body.firstName).to.contain(genData.firstName);
                        expect(res.body.lastName).to.contain(genData.lastName);
                        expect(res.body.email).to.contain(genData.email);


                        return userInfoModel.findById(res.body.id);

                    })
                    .then(function (user) {
                        expect(user.username).to.equal(genData.username);
                        expect(user.firstName).to.equal(genData.firstName);
                        expect(user.lastName).to.equal(genData.lastName);
                        expect(user.email).to.equal(genData.email);
                        expect(user.email).to.have.lengthOf.at.least(1);
                        expect(user.email).to.be.a('string');
                        expect(user.email).to.have.string('@');
                        expect(user.email).to.have.string('.');
                        expect(user.lifeSteps).to.be.a('number');
                        expect(user.lifeDistance).to.equal(0);
                        expect(user.lifeSteps).to.be.a('number');
                        expect(user.lifeDistance).to.equal(0);

                    })
            })



        });


        //USERS TEST BLOCK END
    });

    // STATS TEST BLOCK

    describe('STATS TEST SET', function () {


        it('post new stats by usertoken', function () {

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
                            expect(res.body.exertype).to.be.oneOf(['walk', 'run']);

                        })

                })



        })

        it('request user stats by usertoken', function () {

            const dbID = userData._id;

            return chai.request(app)
                .get(`/site/stats/${dbID}`)
                .set('Authorization', `Bearer ${testToken}`)
                .then(function (res) {

                    expect(res).to.have.status(200);
                    expect(res).to.be.a('object');
                    expect(res.body.userStats[0]).to.have.all.keys('id', 'user', 'date', 'steps', 'distance', 'exertype')
                    expect(res.body.userStats[0].id).to.have.lengthOf.at.least(1);
                    expect(res.body.userStats[0].id).to.be.a('string');
                    expect(res.body.userStats[0].user).to.have.lengthOf.at.least(1);
                    expect(res.body.userStats[0].user).to.be.a('string');
                    expect(res.body.userStats[0].date).to.have.lengthOf.at.least(1);
                    expect(res.body.userStats[0].date).to.be.a('string');
                    expect(res.body.userStats[0].steps).to.be.a('number');
                    expect(res.body.userStats[0].distance).to.be.a('number');
                    expect(res.body.userStats[0].exertype).to.be.oneOf(['walk', 'run']);
                    expect(res.body.userStats[0].id).to.have.string(statData._id);
                    expect(res.body.userStats[0].steps).to.equal(statData.steps);
                    expect(res.body.userStats[0].distance).to.equal(statData.distance);
                    expect(res.body.userStats[0].exertype).to.have.string(statData.exertype);

                })

        })


        it('delete user stat document', function () {

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
                        .get(`/site/${dbID}`)
                        .set('Authorization', `Bearer ${testToken}`)
                        .then(function (res) {

                            expect(res).to.not.have.status(200);
                            expect(res.body).to.have.all.keys('code', 'reason', 'location', 'message')
                            expect(res.body.reason).to.have.string('ERROR');
                            expect(res.body.message).to.have.string('unable to find id');

                        })
                })

        })


        it('update all stats, then request and verify', function () {

            const dbID = statData._id;

            let newVal = {
                id: statData._id,
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

                    expect(res).to.have.status(200);
                    expect(res.body).to.have.all.keys('code', 'reason', 'location', 'message');
                    expect(res.body.reason).to.have.string('SUCCESS');
                    expect(res.body.message).to.have.string('User record has been updated');

                }).then(function () {

                    return chai.request(app)
                        .get(`/site/${dbID}`)
                        .set('Authorization', `Bearer ${testToken}`)
                        .then(function (res) {

                            expect(res).to.have.status(200);
                            expect(res.body).to.have.all.keys('id', 'user', 'date', 'steps', 'distance', 'exertype')
                            expect(res.body.steps).to.equal(newVal.steps);
                            expect(res.body.distance).to.equal(newVal.distance);
                            expect(res.body.exertype).to.equal(newVal.exertype);

                        })
                })

        });


        it('update lifetime stats, then request and verify', function () {

            const dbID = userData._id

            let newVal = {
                id: `${dbID}`,
                lifeSteps: faker.random.number(),
                lifeDistance: faker.random.number()
            };

            return chai.request(app)
                .put(`/users/update/${dbID}`)
                .set('Authorization', `Bearer ${testToken}`)
                .set('Content-Type', 'application/json')
                .send(newVal)
                .then(function (res) {

                    expect(res).to.have.status(200);

                    expect(res.text).to.have.string(`${dbID} has been updated`);

                }).then(function () {

                    return chai.request(app)
                        .get(`/users/${dbID}`)
                        .set('Authorization', `Bearer ${testToken}`)
                        .then(function (res) {

                            expect(res).to.have.status(200);
                            expect(res.body).to.have.all.keys('id', 'lifeSteps', 'lifeDistance', 'id', 'username', 'firstName', 'lastName')
                            expect(res.body.lifeSteps).to.equal(newVal.lifeSteps);
                            expect(res.body.lifeDistance).to.equal(newVal.lifeDistance);

                        })
                })

        });


        // END STATS TEST BLOCK
    })


    //TEST RESOURCES END
});
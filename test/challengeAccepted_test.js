'use strict';

const chai = require('chai');

const chaiHttp = require('chai-http');

const faker = require('faker');

const mongoose = require('mongoose');

const expect = chai.expect;

const {exerStatsModel, userInfoModel} = require('../models')

const {app, startServer, stopServer} = require('../server');

const TEST_DATABASE_URL = 'mongodb://localhost/test-blog-app-2';

//const TEST_DATABASE_URL = require('../config');;

chai.use(chaiHttp);

//Create test data for User Collection
function populateTestData() {
    console.info('test data is being created');
    const testData = [];

    for(let i=1; i<10; i++) {
        testData.push(generateData());
        return userInfoModel.insertMany(testData);
    }
};

function generateData() {
    return {
        username: faker.internet.userName(),
        password: faker.internet.password(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        lifeSteps: faker.random.number(),
        lifeDistance: faker.random.number()
    }
};



function resetDB() {
    console.warn('DB will be deleted and reset');
    return mongoose.connection.dropDatabase();
};

describe('Test Resources', function() {

    //BEFORE - RUNS TO START SERVER
    before(function() {
        return startServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        return populateTestData();
    });

    afterEach(function() {
        return resetDB();
    });

    after(function() {
        return stopServer();
    });


    const jwt = require('jsonwebtoken');

    describe('auth', function() {
        it('should return typeof html and status 200', function() {
            const username = "username"; 
        const firstName = "firsrtname";
        const lastName = "whatever";
        const token = jwt.sign(
            {
              user: {
                username,
                firstName,
                lastName
              }
            },
            'secret',
            {
              algorithm: 'HS256',
              subject: username,
              expiresIn: '7d'
            }
          );
            return chai.request(app)
            .get('/users/123')
            .set('authorization', `Bearer ${token}`)
            .then(function(res) {
                expect(res).to.not.have.status(401);
            })
        })
    })


    describe('HTML TEST SET', function() {


        it('should return typeof html and status 200', function() {
            return chai.request(app)
            .get('/')
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.html;
            })
        })
    });
  
    //USER TESTS
    describe('GET USERS TEST SET', function() {

        it('GET DB objects, validate count and json/200 resp', function() {

            let res;

            return chai.request(app)
            .get('/users')
            .then(function(_res) {
                res = _res;

                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.users).to.have.lengthOf.at.least(1);
                return userInfoModel.count();
            })

            .then(function(count) {
                expect(res.body.users).to.have.lengthOf(count);
            })
        });

        it('GET DB objects and verify expected keys present', function() {
            let respUsers = [];
            let recordCount = userInfoModel.count();

            return chai.request(app)
            .get('/users')

            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.users).to.have.lengthOf.at.least(1);

                res.body.users.forEach(function(user) {
                    expect(user).to.be.a('object');
                    expect(user).to.include.keys('id', 'username', 'firstName', 'lastName', 'email', 'lifeSteps', 'lifeDistance');
                })

                respUsers = res.body.users[0];
                return userInfoModel.findById(respUsers.id)
                
            })
            
            .then(function(user) {
                expect(respUsers.id).to.be.equal(user.id);
                expect(respUsers.username).to.be.equal(user.username); 
                expect(respUsers.firstName).to.be.equal(user.firstName);                
                expect(respUsers.lastName).to.be.equal(user.lastName);                
                expect(respUsers.email).to.be.equal(user.email);                
                expect(respUsers.lifeSteps).to.be.equal(user.lifeSteps);                
                expect(respUsers.lifeDistance).to.be.equal(user.lifeDistance);                
               
            })
        })


    //GET USERS TEST BLOCK END
    });

    //CREATE NEW USER TEST BLOCK
    describe('CREATE USER TEST SET', function() {

        it('Will POST data to create new user', function() {

            const genData = generateData();

            return chai.request(app)

            .post('/users')

            .send(genData)

            .then(function(res) {
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res).to.be.a('object');
              
                expect(res.body).to.include.keys('id', 'username', 'firstName', 'lastName', 'email');
                expect(res.body.username).to.contain(genData.username);
                expect(res.body.firstName).to.contain(genData.firstName);
                expect(res.body.lastName).to.contain(genData.lastName);
                expect(res.body.email).to.contain(genData.email);

                
                return userInfoModel.findById(res.body.id);

            })
            .then(function(user) {
                expect(user.username).to.equal(genData.username);
                expect(user.firstName).to.equal(genData.firstName);
                expect(user.lastName).to.equal(genData.lastName);
                expect(user.email).to.equal(genData.email);


            })
        })



        //ADD TESTS TO CHECK ERROR CONDITIONS!!!!




    });
    //CREATE NEW USER TEST BLOCK END




//TEST RESOURCES END
});
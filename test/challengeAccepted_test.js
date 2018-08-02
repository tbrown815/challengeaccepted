const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, startServer, stopServer} = require('../server');

const expect = chai.expect;

chai.use(chaiHttp);

describe('This is a basic test', function() {


    before(function() {
        return startServer();
    });

    after(function() {
        return stopServer();
    });

    it('should return typeof html and status 200', function() {
        return chai.request(app)
        .get('/')
        .then(function(res) {
            expect(res).to.have.status(200);
            expect(res).to.be.html;
        })


    })





})
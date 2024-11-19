'use strict';

var should = require('should');
var app = require('../../../../../../app');
var request = require('supertest');
var describe = require('describe');

describe('GET /api/kycs', function() {

    it('should respond with JSON array', function(done) {
        request(app)
            .get('/api/kycs')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.be.instanceof(Array);
                done();
            });
    });
});
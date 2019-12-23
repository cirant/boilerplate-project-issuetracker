/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
var mongoose = require('mongoose');
const Issue = require('../models/issue');
const Project = require('../models/project');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  let issusId;

  this.beforeAll(done => {
    mongoose.connect(process.env.MONGO_DB_TEST || process.env.MONGO_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    }).then(async () => {
      const project = await Project.create({
        name: 'test'
      });
      const issue = await Issue.create({
        projectId: project._id,
        issue_title: 'Title',
        issue_text: 'text',
        created_by: 'Functional Test - Every field filled in',
        assigned_to: 'Chai and Mocha',
        status_text: 'In QA'
      });
      issusId = issue._id;
      done();
    })
      .catch(err => console.log('err', err))
  });

  suite('POST /api/issues/{project} => object with issue data', function () {

    test('Every field filled in', function (done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          const { body } = res;
          assert.isTrue(body.open, 'open should be true by default');
          assert.equal(body.issue_title, 'Title');
          assert.equal(body.issue_text, 'text');
          assert.equal(body.created_by, 'Functional Test - Every field filled in');
          assert.equal(body.assigned_to, 'Chai and Mocha');
          assert.equal(body.status_text, 'In QA');
          assert.isNotNull(body.created_on, 'it should be not null when the document is created');
          assert.isNotNull(body.updated_on, 'it should be not null when the document is created');
          done();
        });
    });

    test('Required fields filled in', function (done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          const { body } = res;
          assert.isTrue(body.open, 'open should be true by default');
          assert.equal(body.issue_title, 'Title');
          assert.equal(body.issue_text, 'text');
          assert.equal(body.created_by, 'Functional Test - Every field filled in');
          assert.equal(body.assigned_to, '');
          assert.equal(body.status_text, '');
          assert.isNotNull(body.created_on, 'it should be not null when the document is created');
          assert.isNotNull(body.updated_on, 'it should be not null when the document is created');
          done();
        });
    });

    test('Missing required fields', function (done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({})
        .end(function (err, res) {
          assert.equal(res.status, 400);
          const { text } = res;
          assert.equal(text, 'issue_title, issue_text and created_by are required');
          done();
        });
    });

  });

  suite('PUT /api/issues/{project} => text', function () {

    test('No body', function (done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({ _id: issusId })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'no updated field sent');
          done();
        });
    });

    test('One field to update', function (done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({ _id: issusId, issue_title: 'Title updated' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'successfully updated');
          done();
        });
    });

    test('Multiple fields to update', function (done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({ _id: issusId, issue_title: 'Title updated', status_text: 'In QA updated' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'successfully updated');
          done();
        });
    });

  });

  suite('GET /api/issues/{project} => Array of objects with issue data', function () {

    test('No filter', function (done) {
      chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
    });

    test('One filter', function (done) {
      chai.request(server)
        .get('/api/issues/test')
        .query({ open: true })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          const aFalse = res.body.some((el) => el.open === false);
          assert.isFalse(aFalse);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
    });

    test('Multiple filters (test for multiple fields you know will be in the db for a return)', function (done) {
      chai.request(server)
        .get('/api/issues/test')
        .query({ open: true, assigned_to: 'Chai and Mocha' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
    });

  });

  suite('DELETE /api/issues/{project} => text', function () {

    test('No _id', function (done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({})
        .end(function (err, res) {
          assert.equal(res.status, 400);
          assert.equal(res.text, '_id error');
          done();
        });
    });

    test('Valid _id', function (done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({ _id: issusId })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, `deleted ${issusId}`);
          done();
        });
    });

  });

  this.afterAll((done) => {
    mongoose.connection.db.collections().then(async collections => {
      for (let collection of collections) {
        await collection.drop();
      }
    }).then(() => {
      mongoose.disconnect();
      done()
    })
  });

});

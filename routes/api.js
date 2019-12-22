/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var projectController = require('../controller/project');

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(projectController.index)

    .post(projectController.create)

    .put(projectController.update)

    .delete(projectController.delete);

};

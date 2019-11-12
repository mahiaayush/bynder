const express = require('express');
const postRoutes = express.Router();
const request = require('request');
const OAuth   = require('oauth-1.0a');
const crypto  = require('crypto');
const await = require("await");
const async = require("async");
//let Mdb = require('./post.model');
//let appConfig=require('./config');

var jwt = require('express-jwt');
var auth = jwt({
  secret: 'MY_SECRET',
  userProperty: 'payload'
});

postRoutes.route('/artlogdata').get(function (req, res) {
  res.send(req);
  // let noSql=[];
  // Mdb.bynder_jobs.find(noSql).limit(200).then((dt)=>{
  //   res.send(dt);
  // }).catch((Err)=>{
  //   console.log("art log select error:", Err);
  // });
});

postRoutes.route('/checkLogin').get(function (req, res) {
  res.send(req);
  // let noSql=[];
  // Mdb.bynder_jobs.find(noSql).limit(200).then((dt)=>{
  //   res.send(dt);
  // }).catch((Err)=>{
  //   console.log("art log select error:", Err);
  // });
});

module.exports = postRoutes;
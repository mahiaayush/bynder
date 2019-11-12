const express = require('express');
const postRoutes = express.Router();
const request = require('request');
const OAuth   = require('oauth-1.0a');
const crypto  = require('crypto');
const await = require("await");
const async = require("async");
let Mdb = require('./post.model');
let appConfig=require('./config');

postRoutes.route('/artlogdata').get(function (req, res) {
  let noSql=[];
  Mdb.bynder_jobs.find(noSql).limit(200).then((dt)=>{
    res.send(dt);
  }).catch((Err)=>{
    console.log("art log select error:", Err);
  });
});

module.exports = postRoutes;

function dateDiffC(date1, date2){
  var dateFirst = new Date(date1);
  var dateSecond = new Date(date2);
  var timeDiff = Math.abs(dateSecond.getTime() - dateFirst.getTime());
  return  Math.ceil(timeDiff / (1000  *3600*  24))||0;
}
function MpsDateFormat(d) {
  let month, day, year;
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month, day].join('-');
}
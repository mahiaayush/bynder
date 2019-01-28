const express = require('express');
const postRoutes = express.Router();
const request = require('request');
const OAuth   = require('oauth-1.0a');
const crypto  = require('crypto');
//const APIS = require('./service.config');
//var config = require('./config');
// Require Post model in our routes module
let Mdb = require('./post.model');
//let Bynder_jobs= require('./post.model');
let appConfig=require('./config');



const oauth = OAuth({
  consumer: {
    key: '71BEFFCC-2CC9-476D-93A8A79BB92BD87B',
    secret: 'a8de7d89165b8234405b35c83553a318'
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  }
});
const token = {
  key: 'E07A70F7-4145-44D6-AC53C771E792A609',
  secret: '2a044b35eebcb94d315b77f02a31a86b'
};


postRoutes.route('/getWorkflowPreset/:campaignId').get(function (req, res) {
  let campaignId = req.params.campaignId;
  console.log("getWorkflowPreset",campaignId);
  let options = {
      allowDiskUse: true
  };
  let pipeline = [
      {
          "$project": {
              "_id": 0,
              "job_presets": "$$ROOT"
          }
      }, 
      {
          "$lookup": {
              "localField": "job_presets.ID",
              "from": "bynder_jobs",
              "foreignField": "presetID",
              "as": "bynder_jobs"
          }
      }, 
      {
          "$unwind": {
              "path": "$bynder_jobs",
              "preserveNullAndEmptyArrays": false
          }
      }, 
      {
          "$match": {
              "bynder_jobs.campaignID": campaignId
          }
      }, 
      {
          "$project": {
              "job_presets.name": "$job_presets.name",
              "job_presets.ID": "$job_presets.ID"
          }
      },{$group:{_id:'$job_presets.ID', ID:{$first:'$job_presets.ID'}, name: {$first:'$job_presets.name'} }}
  ];
  
      Mdb.job_presets.aggregate( pipeline, function (err, result) {
        if (err) { console.log(err); next(err);} else {
          res.send(result);
        }
      });
  
});
//scorecarddata ///
postRoutes.route('/scorecarddata').post(function (req, res) {
  let campaignId = req.params.campaignId;
  console.log("getWorkflowPreset",campaignId);
      console.log("data comming ..=>", req.body);
      //try
      let compaignId ="", workflowPreset="", currentStatus=[] , jobType="", startDate="", endDate="";
      if(req.body.compaignId){
        compaignId=req.body.compaignId;
      }
      if(req.body.workflowPreset){
        workflowPreset=req.body.workflowPreset;
      }
      if(req.body.currentStatus ){
        currentStatus=req.body.currentStatus;
      }
      if(req.body.jobType ){
        jobType=req.body.jobType.split("-").join("");
      }
      if(req.body.startDate ){
        startDate=req.body.startDate;
      }
      if(req.body.endDate ){
        endDate=req.body.endDate;
      }
     let pipeline=[];
      pipeline.push( {"$group" : {_id: {
        "campaignID": "$campaignID", "status":"$job_active_stage.status"   },  count:{$sum:1} } } );
      console.log("Data Fetch Query :", JSON.stringify(pipeline));
      
      Mdb.bynder_jobs.aggregate( pipeline, function (err, result) {
        if (err) { console.log(err); next(err);} else {
          let dumpCampIds=[];
          for (var keys in result) {
            if(dumpCampIds.indexOf(result[keys]._id.campaignID) != -1){
              dumpCampIds.push(result[keys]._id.campaignID);
            }
          }
          // var q2= {
          //   ID: {
          //       $in: ['tet', 'tsss']
          //   }
          //   }, { ID: 1, name: 1 };
          // Mdb.bynder_jobs.find(q2)
          res.send(result);
        }
      });
});

postRoutes.route('/getjobsbycampaignid/').post(function (req, res) {
  console.log("data comming ..=>", req.body);
  //try
  let compaignId ="", workflowPreset="", currentStatus=[] , jobType="", startDate="", endDate="",modules='',grade='';
  if(req.body.compaignId){
    compaignId=req.body.compaignId;
  }
  if(req.body.workflowPreset){
    workflowPreset=req.body.workflowPreset;
  }
  if(req.body.currentStatus ){
    currentStatus=req.body.currentStatus;
  }
  if(req.body.jobType ){
    jobType=req.body.jobType.split("-").join("");
  }
  if(req.body.modules ){
    modules=req.body.modules.split("-").join("");
  }
  if(req.body.grade ){
    grade=req.body.grade.split("-").join("");
  }
  if(req.body.startDate ){
    startDate=req.body.startDate;
  }
  if(req.body.endDate ){
    endDate=req.body.endDate;
  }
  console.log("getjobsbycampaignid",req.body);
  var  query=[];
  if(compaignId!=""){
    query.push({$match: { campaignID: { $eq: compaignId } } }) ;
  }
  var  lookup1={ $lookup:{ localField: "presetID",  from: "job_presets", foreignField : "ID",as: "joincollection"}};
  var  lookup2={ $lookup:{ localField: "createdByID", from: "users", foreignField : "ID", as: "joincollection2"}};
  var  lookup3={ $lookup:{ localField: "campaignID", from:"campaign",foreignField : "ID", as: "joincollection3" }};
  var  lookup4={"$lookup":{"localField":"jobID","from":"ExportSheetData","foreignField":"job_id","as":"joincollection4"}};
    query.push(lookup1);
    query.push(lookup2);
    query.push(lookup3);
    query.push(lookup4);
    let criteria = [];
    if(workflowPreset!=""){
        criteria.push({ 'joincollection.name':{$regex:  new RegExp(".*"+workflowPreset+".*") }});
    }
    if(currentStatus.length>0){
        criteria.push({ 'job_active_stage.status':{$in:  currentStatus }});
    }
    if(jobType!=""){
        criteria.push({'jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c':{$eq:jobType}});
    }
    if(modules!=""){
      criteria.push({'jobMetaproperties.7388493928bc4a9aa57ca65306ed1579':{$eq:modules}});
    }
    if(grade!=""){
      criteria.push({'jobMetaproperties.c0ac0a86e65f4f7ebd88dbd7e77965ef':{$eq:grade}});
    }
    if(startDate!=""){
        criteria.push({'jobMetaproperties.e9074f5b472f41d4a92ac511e53da775':{$gte: startDate }});
    }
    if(endDate!=""){
        criteria.push({'jobMetaproperties.57046bf7e7624ab5bc4b8e16664b4cf8':{$lte: endDate }});
    }
    if(criteria.length > 0){
        criteria = criteria.length > 0 ? { $and: criteria } : {};
        query.push(  { $match: criteria });
    }
    var limit={ $limit : 100};
    
    //query.push({$skip: 50});
    query.push(limit);
  console.log("data query is :", JSON.stringify(query));
  Mdb.bynder_jobs.aggregate(query, function (err, result) {
        if (err) { next(err);} else {
          var arrayMetakeys=[];
          for (var key in result) {
            if(result[key].hasOwnProperty('jobMetaproperties')){
              for(var key2 in result[key].jobMetaproperties){
                if(arrayMetakeys.indexOf(key2)==-1){
                  arrayMetakeys.push(key2);
                }
              }
            }
          }
            Mdb.metaproperties.find({tempId: { $in: arrayMetakeys }},{ label: 1, tempId: 1, options:1 }, function (err, rs) {
              for (var key=0; key<result.length; key++) {
                result[key].jobMetaData=[];
                //console.log(result[key].jobMetaproperties);
                
              //Object.defineProperty(result[key], 'labelData', { value: [], writable: true });
              //result[key].jobMetaData=;
              if(result[key].hasOwnProperty('jobMetaproperties')){
               var data={};
                for(var key2 in result[key].jobMetaproperties){
                  for(var dt in rs){
                   if(rs[dt].tempId==key2){
                   // eval(data.key2)=rs[dt].label;
                   // data.push({ rs[dt].tempId : rs[dt].label});
                      result[key].jobMetaData.push({label: rs[dt].label, tempId: rs[dt].tempId,options: rs[dt].options});
                    }
                  }
                }
              //  console.log(dt);
              }
             }
            // console.log(result[0]);
             res.send(JSON.stringify(result));
            // for
            });
          //console.log("Count is :", arrayMetakeys.length , "arrayMetakeys Data :", arrayMetakeys);
          //res.send(result);
        }
      });
});
// Defined get data(index or listing) route
postRoutes.route('/getAllcampaigns').get(function (req, res) {
  console.log("getPost");
  Mdb.campaign.find(function(err, data){
    if(err){
      res.json(err);
    }
    else {
      res.json(data);
    }
  });
});

// // Defined get data(index or listing) route
postRoutes.route('/getgrademodule/:id').get(function (req, res) {
  let id = req.params.id;
  console.log(id);
  let query={ tempId : id};
  Mdb.metaproperties.find(query ,function(err, data){
    if(err){
      res.json(err);
    } else {
      res.json(data);
    }
  });
});

// // Defined edit route
// postRoutes.route('/edit1/:id').get(function (req, res) {
//   let id = req.params.id;
//   Post.findById(id, function (err, post){
//       if(err) {
//         res.json(err);
//       }
//       res.json(post);
//   });
// });

// //  Defined update route
// postRoutes.route('/update/:id').post(function (req, res) {
//     Post.findById(req.params.id, function(err, post) {
//     if (!post)
//       res.status(404).send("data is not found");
//     else {
//         post.title = req.body.title;
//         post.body = req.body.body;
//         post.save().then(() => {
//           res.json('Update complete');
//       })
//       .catch(() => {
//             res.status(400).send("unable to update the database");
//       });
//     }
//   });
// });

// // Defined delete | remove | destroy route
// postRoutes.route('/delete/:id').delete(function (req, res) {
//     Post.findByIdAndRemove({_id: req.params.id}, function(err){
//         if(err) res.json(err);
//         else res.json('Successfully removed');
//     });
// });

module.exports = postRoutes;
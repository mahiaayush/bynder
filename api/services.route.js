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



// const oauth = OAuth({
//   consumer: {
//     key: '71BEFFCC-2CC9-476D-93A8A79BB92BD87B',
//     secret: 'a8de7d89165b8234405b35c83553a318'
//   },
//   signature_method: 'HMAC-SHA1',
//   hash_function(base_string, key) {
//     return crypto.createHmac('sha1', key).update(base_string).digest('base64');
//   }
// });
// const token = {
//   key: 'E07A70F7-4145-44D6-AC53C771E792A609',
//   secret: '2a044b35eebcb94d315b77f02a31a86b'
// };

// postRoutes.route('/jobsbycampaignid/:campaignId').get(function (req, res) {
//   let campaignId = req.params.campaignId;
//   var request_data=appConfig.getActionInfo("jobsbycampaignid", campaignId);
//   var token=appConfig.getToken();
//   //console.log("jobsbycampaignid", request_data);
// 	request({
// 		url: request_data.url,
// 		method: request_data.method,
// 		form: request_data.data,
// 		headers: oauth.toHeader(oauth.authorize(request_data, token))
// 	}, function(error, response, body) {

//     var JobsResult = JSON.parse(response.body);
//     //let bynder_jobs = new Bynder_jobs();
    
//     var results=[];
//     for(let k=0; k< JobsResult.length; k++){
//      //console.log(JobsResult[k]);
//      Mdb.bynder_jobs.find({id:JobsResult[k].id}, function(err ,docs){
//       if(docs.length>0){
//         /*var  bynder_jobs=new Mdb.bynder_jobs();
//         bynder_jobs.update({id:JobsResult[k].id},{ name: JobsResult[k].name, deadline: JobsResult[k].deadline, description:JobsResult[k].description, dateCreated:JobsResult[k].dateCreated, basedOnPreset: JobsResult[k].basedOnPreset, presetId:JobsResult[k].presetId, dateModified: JobsResult[k].dateModified, compaingID:JobsResult[k].compaingID, jobPrevious_stage: JobsResult[k].jobPrevious_stage, accountableID: JobsResult[k].accountableID, createdByID: JobsResult[k].createdByID, jobMetaproperties: JobsResult[k].jobMetaproperties , isStartedFromBrandstore : JobsResult[k].isStartedFromBrandstore }).then(() => {
//           console.log('business in updated successfully');
//          }).catch(() => {
//            console.log("unable to updated to database");
//          });
//          */
//         if(JobsResult[k].jobMetaproperties){
//           console.log("========>",JobsResult[k].jobMetaproperties);
//         }
//         // results.push(docs);
//       }else{
//         //var bynder_jobs=  Mdb.bynder_jobs;
//         var  bynder_jobs=new Mdb.bynder_jobs(JobsResult[k]);
//         bynder_jobs.save().then(() => {
//          console.log('business in added successfully id:'+ JobsResult[k].id );
//         }).catch(() => {
//           console.log("unable to save to database");
//         });
//         if(JobsResult[k].presetID){
//           //getPresetByJobs('getPresetByJobs', JobsResult[k].presetID);
//         }
//         if(JobsResult[k].jobMetaproperties){
//           console.log(JobsResult[k].jobMetaproperties);
//         }
//       }
      
      
//      // process.exit();
//     });
//     }
//   Mdb.bynder_jobs.aggregate([
//       {$lookup:{
//       localField: "presetID",
//       from: "job_presets",
//       foreignField : "ID",
//       as: "joincollection"
//      }, $lookup:{
//       localField: "createdByID",
//       from: "users",
//       foreignField : "ID",
//       as: "joincollection2" 
//     }, $lookup:{
//       localField: "campaignID",
//       from: "campaign",
//       foreignField : "ID",
//       as: "joincollection3" }
//     }], function (err, result) {
//       if (err) {
//           next(err);
//       } else {
//           //res.json(result);
//           res.send(result);
//       }
//   });
// 	});
// });

// postRoutes.route('/getjobsbycampaignid/:campaignId').get(function (req, res) {
//   let campaignId = req.params.campaignId;

//   console.log("getjobsbycampaignid",campaignId);
//     Mdb.bynder_jobs.aggregate([
//       //{ $match: {"presetID": campaignId} },
//      /* { 
//         $match: { 
//             $and: [
//                 { presetID: { $eq: campaignId } }, 
//               ]                   
//         } 
//     }, */
//       { $lookup:{
//       localField: "presetID",
//       from: "job_presets",
//       foreignField : "ID",
//       as: "joincollection"
//     }},{ $lookup:{
//       localField: "createdByID",
//       from: "users",
//       foreignField : "ID",
//       as: "joincollection2"}
  
//   }], function (err, result) {
//       if (err) {
//           next(err);
//       } else {
//          // console.log("getjobsbycampaignid", result);
//         //  var metaIdArra=[];
//         //  for(let i=0; i< result.length; i++ ){
//         //     if( result[i].jobMetaproperties ){
//         //      var dt= Object.entries(result[i].jobMetaproperties);
//         //      //console.log(dt);
//         //      for(let k=0;k< dt.length; k++){
//         //       metaIdArra.push(dt[k][0]);
//         //       //console.log(" ========> ", dt[k][0]);
//         //      }
//         //     }
//         //  }
        
//           res.send(result);
//       }
//   });
// });

// function getPresetByJobs( action, id){
//   //console.log(action, id);
//    var request_data=appConfig.getActionInfo(action, id);
//    console.log(request_data);
//   var token=appConfig.getToken();
//   console.log(request_data);
// 	request({
// 		url: request_data.url,
// 		method: request_data.method,
// 		form: request_data.data,
// 		headers: oauth.toHeader(oauth.authorize(request_data, token))
// 	}, function(error, response, body) {
//     var JobsPresets = JSON.parse(response.body);
//     JobsPresets = JobsPresets.preset;
//     console.log('-------> :',JobsPresets);
   

//       var  job_presets=new Mdb.job_presets(JobsPresets);
//         job_presets.save().then(() => {
//          console.log('job_presets in added successfully id:'+ JobsPresets);
//          //process.exit();
//         }).catch((e) => {
//           console.log("unable to save job_presets", e);
//           //process.exit();
//         });
       
    
//    // console.log(response.body);
//   })
// }
// //var getData

// postRoutes.route('/Retrieve_all_campaigns').get(function (req, res) {
//   const request_data = {
// 	  url: 'https://greatminds.getbynder.com/api/workflow/campaigns/',
// 	  method: 'GET',
// 	  data: { status: 'Hello Ladies + Gentlemen, a signed OAuth request!' }
// 	};
// 	request({
// 		url: request_data.url,
// 		method: request_data.method,
// 		form: request_data.data,
// 		headers: oauth.toHeader(oauth.authorize(request_data, token))
// 	}, function(error, response, body) {
// 		console.log('Retrieve_all_campaigns','statusCode:', response.statusCode);
// 		res.send(response.body);
// 	});
//   //res.status(200).json({'business': 'business in added successfully'});
//   console.log('data');
// });
// postRoutes.route('/users/').get(function (req, res) {
//   var request_data=appConfig.getActionInfo("users");
//    console.log(request_data);
//   var token=appConfig.getToken();
//   console.log(request_data);
// 	request({
// 		url: request_data.url,
// 		method: request_data.method,
// 		form: request_data.data,
// 		headers: oauth.toHeader(oauth.authorize(request_data, token))
// 	}, function(error, response, body) {

//     console.log('UsersData','statusCode:', response.statusCode);
//     var UsersData = JSON.parse(response.body);
//     console.log(UsersData);
//     for(let k=0; k< UsersData.length; k++){
//       var  users=new Mdb.users(UsersData[k]);
//         users.save().then(() => {
//          console.log('business in added successfully id:'+ UsersData[k] );
//         }).catch(() => {
//           console.log("unable to save to database", UsersData[k]);
//           process.exit();
//         });
//       }
//     res.send("users => save data from db");
    
// 	});
// });
// postRoutes.route('/metaproperties/').get(function (req, res) {
//   let metaId = req.params.metaId;
//   console.log('testing app', metaId);
//   const request_data = {
// 	  url: `https://greatminds.getbynder.com/api/workflow/metaproperties/`,
// 	  method: 'GET',
// 	  data: { status: 'Hello Ladies + Gentlemen, a signed OAuth request!' }
// 	};
// 	request({
// 		url: request_data.url,
// 		method: request_data.method,
// 		form: request_data.data,
// 		headers: oauth.toHeader(oauth.authorize(request_data, token))
// 	}, function(error, response, body) {
//     console.log('metaproperties','statusCode:', response.statusCode);
//     var metapropertiesData = JSON.parse(response.body);

//     for(let k=0; k< metapropertiesData.length; k++){
//       var  metaproperties=new Mdb.metaproperties(metapropertiesData[k]);
//         metaproperties.save().then(() => {
//          console.log('business in added successfully id:'+ metapropertiesData[k] );
//         }).catch(() => {
//           console.log("unable to save to database", metapropertiesData[k]);
//           process.exit();
//         });
//       }
// 		res.send("metaproperties => save data from db");
// 	});
// });

// postRoutes.route('/getPresetByJobs/:presetId').get(function (req, res) {
//   let presetId = req.params.presetId;
//   console.log('testing app /getPresetByJobs/:presetId', presetId);
//   //res.send("hello testing 123"+presetId);
//   const request_data = {
// 	  url: `https://greatminds.getbynder.com/api/workflow/presets/job/`+presetId ,
// 	  method: 'GET',
// 	  data: { status: 'Hello Ladies + Gentlemen, a signed OAuth request!' }
//   };
//   console.log(request_data.url);
// 	request({
// 		url: request_data.url,
// 		method: request_data.method,
// 		form: request_data.data,
// 		headers: oauth.toHeader(oauth.authorize(request_data, token))
// 	}, function(error, response, body) {

// 		res.send(response.body);
// 	});
// });
// //https://greatminds.getbynder.com/api/workflow/presets/job/ff808081-6543-cfb5-0165-43e0c9560004
// // Defined store route
// postRoutes.route('/add').post(function (req, res) {
//   let post = new Post(req.body);
//   post.save()
//     .then(() => {
//       res.status(200).json({'business': 'business in added successfully'});
//     })
//     .catch(() => {
//       res.status(400).send("unable to save to database");
//     });
// });

// // Defined get data(index or listing) route
// postRoutes.route('/').get(function (req, res) {
//   console.log("getPost");
//     Post.find(function(err, posts){
//     if(err){
//       res.json(err);
//     }
//     else {
//       res.json(posts);
//     }
//   });
// });

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
postDtRoutes.route('/data').get(function (req, res) {
    res.json('Successfully removed');
});
module.exports = postDtRoutes;
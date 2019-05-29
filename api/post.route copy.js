const express = require('express');
const postRoutes = express.Router();
const request = require('request');
const OAuth   = require('oauth-1.0a');
const crypto  = require('crypto');
const await = require("await");
const async = require("async");
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
///ggggggg
postRoutes.route('/getjobsbycampaignid/').get(function (req, res) {
  console.log("data comming ..=>", req.query);
  //try
  
  Mdb.delete_temp_data.find({},{jobID:1}).then((deleteTempData)=>{
   console.log(deleteTempData);;
    var deletedJobIds=[];
    for(let ddd in deleteTempData){
      deletedJobIds.push(deleteTempData[ddd].jobID);
    }

  let compaignId ="", workflowPreset="", currentStatus=[] , jobType="", startDate="", endDate="",modules='',
  grade='', currentPage=1,rowsPage=10;
  if(req.body.currentPage){
    currentPage= req.body.currentPage;
  }
  if(req.body.rowsPage){
    rowsPage= req.body.rowsPage;
  }
 
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
  if(deletedJobIds.length > 0){
    query.push({$match: { id: { $nin: deletedJobIds } } }) ;
  }
  var  lookup1={ $lookup:{ localField: "presetID",  from: "job_presets", foreignField : "ID",as: "joincollection"}};
  var  lookup2={ $lookup:{ localField: "createdByID", from: "users", foreignField : "ID", as: "joincollection2"}};
  var  lookup3={ $lookup:{ localField: "campaignID", from:"campaign",foreignField : "ID", as: "joincollection3" }};
  var  lookup4={"$lookup":{"localField":"jobID","from":"ExportSheetData","foreignField":"job_id","as":"joincollection4"}};
  var project={ $project: { job_duration:1, job_date_finished:1, dateCreated:1,joincollection:1,joincollection2:1,joincollection3:1,joincollection4:1, 
    CalDuration: {
       $cond : { "if" : {'job_date_finished': {$eq: ["$job_date_finished", ''] } },  'then' : {
                      $divide : [{"$subtract":[new Date(),"$dateCreated"]},3600000*24]
              }, 'else' : {  
                  $divide : [{"$subtract":[new Date("$job_date_finished"),"$dateCreated"]},3600000*24]}
              }
          }
      }
    };
    console.log("Projection: ",project);
    query.push(project);
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
    if(true){
      criteria.push({ 'job_active_stage.status':{"$ne":"Cancelled" }});
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
    var countQuery=query;
      var limit={ $limit : currentPage * rowsPage };
      query.push( limit);
      if(currentPage -1 >0){
        var skip= { $skip: (currentPage -1)* rowsPage};
        query.push(skip);
      }else{
        query.push({$skip: 0});
      }
    
  console.log("data query is :", JSON.stringify(query));
      // console.log("data query is :", JSON.stringify(query));
      //   var aggregate = Mdb.bynder_jobs.aggregate();
      //   aggregate.match(query[0])
      //   .group({ _id: '$id' , count : { '$sum' : 1 } });
      //   var options = { page : 1, limit : 15};
      //   Mdb.bynder_jobs.aggregatePaginate(aggregate, query).then(function(value) {
      //     console.log(value);
      //   })
      //   .catch(function(err){ 
      //     console.log("Error is", err);
      //   });
      Mdb.bynder_jobs.count(countQuery).then((coundData)=>{
        console.log("coundData is :", coundData);
      
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
              if(result[key].hasOwnProperty('jobMetaproperties')){
               var data={};
                for(var key2 in result[key].jobMetaproperties){
                  for(var dt in rs){
                   if(rs[dt].tempId==key2){
                      result[key].jobMetaData.push({label: rs[dt].label, tempId: rs[dt].tempId,options: rs[dt].options});
                    }
                  }
                }
              }
             }

             var lastPage=Math.round(coundData/10,1 );
             var queryRes={ total:coundData, per_page:10, current_page:1, lastPage:lastPage,  data: result};
             res.send(JSON.stringify(queryRes));
            });
        }
      });
    }).catch((Err)=>{
      console.log("Error counting is ", Err);
    });
    }).catch((Err)=>{
      console.log("Record not fetched in delete_temp_data", Err);
    });
});



postRoutes.route('/getjobsbycampaignid/').post(function (req, res) {
  console.log("data comming ..=>", req.body);
  //try
  
  Mdb.delete_temp_data.find({},{jobID:1}).then((deleteTempData)=>{
   console.log(deleteTempData);;
    var deletedJobIds=[];
    for(let ddd in deleteTempData){
      deletedJobIds.push(deleteTempData[ddd].jobID);
    }

  let compaignId ="", workflowPreset="", currentStatus=[] , jobType="", startDate="", endDate="",modules='',
  grade='', currentPage=1,rowsPage=10;
  if(req.body.currentPage){
    currentPage= req.body.currentPage;
  }
  if(req.body.rowsPage){
    rowsPage= req.body.rowsPage;
  }
 
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
  if(endDate && endDate.indexOf(" - ")!=-1){
    var dateString= endDate.split(' - ');
    startDate=dateString[0];
    endDate=dateString[1];
  }
  if(startDate && startDate.indexOf(" - ")!=-1){
    var dateString= startDate.split(' - ');
    startDate=dateString[0];
    endDate=dateString[1];
  }
 

  console.log("getjobsbycampaignid",req.body);
  var  query=[];
  if(compaignId!=""){
    query.push({$match: { campaignID: { $eq: compaignId } } }) ;
  }
  if(deletedJobIds.length > 0){
    query.push({$match: { id: { $nin: deletedJobIds } } }) ;
  }
  var  lookup1={ $lookup:{ localField: "presetID",  from: "job_presets", foreignField : "ID",as: "joincollection"}};
  var  lookup2={ $lookup:{ localField: "createdByID", from: "users", foreignField : "ID", as: "joincollection2"}};
  var  lookup3={ $lookup:{ localField: "campaignID", from:"campaign",foreignField : "ID", as: "joincollection3" }};
  var  lookup4={"$lookup":{"localField":"jobID","from":"ExportSheetData","foreignField":"job_id","as":"joincollection4"}};
  var project={"$project":{"job_duration":1,"job_date_finished":1,"dateCreated":1, "job_active_stage":1,"presetID":1,"createdByID":1,"campaignID":1,"jobID":1,
  "jobMetaproperties":1,
  "CalDuration":{"$cond":{"if":{"job_date_finished":{"$eq":["$job_date_finished",""]}},"then":
  {"$divide":[{"$subtract":[new Date(),"$dateCreated"]},86400000]},"else":
  {"$divide":[{"$subtract":["$job_date_finished", "$dateCreated"]},86400000]}}}}};
    console.log("Projection: ",project);
    query.push(project);
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
    if(true){
      criteria.push({ 'job_active_stage.status':{"$ne":"Cancelled" }});
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
    var countQuery=[];
    for(let kkk in query){
      countQuery.push(query[kkk]);
    }
      var limit={ $limit : currentPage * rowsPage };
      query.push( limit);
      if(currentPage -1 >0){
        var skip= { $skip: (currentPage -1)* rowsPage};
        query.push(skip);
      }else{
        query.push({$skip: 0});
      }
      countQuery.push({ $group: { _id: null, myCount: { $sum: 1 } } });
      console.log("data query is :", JSON.stringify(query));
      // console.log("data query is :", JSON.stringify(query));
      //   var aggregate = Mdb.bynder_jobs.aggregate();
      //   aggregate.match(query[0])
      //   .group({ _id: '$id' , count : { '$sum' : 1 } });
      //   var options = { page : 1, limit : 15};
      //   Mdb.bynder_jobs.aggregatePaginate(aggregate, query).then(function(value) {
      //     console.log(value);
      //   })
      //   .catch(function(err){ 
      //     console.log("Error is", err);
      //   });
      console.log("countQuery is",JSON.stringify(countQuery) );
      Mdb.bynder_jobs.aggregate(countQuery).then((rsCount)=>{
        var coundData=1;
        if(rsCount.length>0 && rsCount[0].hasOwnProperty('myCount')){
          coundData=rsCount[0].myCount;
        }
        console.log("coundData is :", coundData);
      
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
              if(result[key].hasOwnProperty('jobMetaproperties')){
               var data={};
                for(var key2 in result[key].jobMetaproperties){
                  for(var dt in rs){
                   if(rs[dt].tempId==key2){
                      result[key].jobMetaData.push({label: rs[dt].label, tempId: rs[dt].tempId,options: rs[dt].options});
                    }
                  }
                }
              }
             }
             var queryRes={rowCount:coundData, rows: result};
             res.send(JSON.stringify(queryRes));
            });
        }
      });
    }).catch((Err)=>{
      console.log("Error counting is ", Err);
    });
    }).catch((Err)=>{
      console.log("Record not fetched in delete_temp_data", Err);
    });
});
//cleartempdata
postRoutes.route('/cleartempdelete/').get(function (req, res) {
  Mdb.delete_temp_data.deleteMany({})
  .then((dt)=>{
     res.send("delete_temp_data data deleted");
    }).catch((Err)=>{
    res.send("delete_temp_data deleting error:",Err);
  });
});
postRoutes.route('/deletetempData/').post(function (req, res) {
  console.log("data accessed with deletetempData", req.body);
  if(req.body.tempIds && req.body.tempIds.length >0){
    var Ids=req.body.tempIds;
    for(let i=0; i< Ids.length; i++){
      var delet_temp_data={ 
        jobID: Ids[i],
        deletedDate:  new Date("<YYYY-mm-ddTHH:MM:ss>"),
        userBy: '',
      };
        var delete_temp_data=new Mdb.delete_temp_data(delet_temp_data);
          delete_temp_data.save().then(() => {
           console.log('Saved successfully data from temp :'+ JSON.stringify(delet_temp_data) );
          }).catch((Err) => {
            console.log("unable to save data from temp ", JSON.stringify(delet_temp_data));
          });
    }  
    res.send(req.body.tempIds);
  }
});

postRoutes.route('/getjoburation/:jobID').get(function (req, res) {
  let jobID = req.params.jobID;
  var find={job_id: jobID };
  var proj={ 'Preset_Stages.Stage_Name':1, 'Preset_Stages.Stage_Duration':1 };
  console.log("Query is ==>", find);
  Mdb.ExportSheetData.find(find, proj)
  //.projection({ 'Preset_Stages.Stage_Name':1, 'Preset_Stages.Stage_Duration':1 })
  .then((ress)=>{
    var query2=[{"$lookup":{"localField":"presetID","from":"job_presets","foreignField":"ID","as":"c"}},
    {$match:{jobID:jobID}},
    {$project: {"job_stages":1, "Preset_Stages":1, "c.presetstages":1}}];

    console.log("ExportSheetData data is =======> ", JSON.stringify(ress));
    console.log("bynder_jobs Query is =======> ", JSON.stringify(query2));
      Mdb.bynder_jobs.aggregate( query2 ).then((data)=>{
        console.log("bynder_jobs data is =======> ", JSON.stringify(data));
        var data={ ExportSheetData: ress , bynder_jobs: data};
        res.send(data);
      }).catch((Err)=>{
        console.log("Select bynder_job data error");
      });
    
      //res.send(ress);
    
  }).catch((Err)=>{
    console.log("data founding error in ===>"+ Err);
  });
});

// Defined get data(index or listing) route
postRoutes.route('/getAllcampaigns').get(function (req, res) {
  console.log("getPost");
  Mdb.campaign.find(
    //{ name: mb.regex.notContains("test") }
    //'3b6d57c7-55c1-489b-aeff-b81b7aaff1ef', '0ad18ec8-8648-4d15-8681-2c3f4e0ee914',
    //for crone job testing
    { ID: {
      $nin: ['bb6f3943-5a47-49f0-ab82-c6278d1dad29']
    }
  }, function(err, data){
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
postRoutes.route('/jobtypes/:id').get(function (req, res) {
  let id = req.params.id;
  console.log(id);
  let query={ ID : id};
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


postRoutes.route('/exportAsExcel').post(function (req, res) {
  let compaignId ="", workflowPreset="", currentStatus=[] , jobType="", startDate="", endDate="",modules='',
  grade='';
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
      Mdb.delete_temp_data.find({},{jobID:1}).then((TempDeletedata)=>{
        var deletedJobIds=[];
        for(var dd in TempDeletedata){
          deletedJobIds.push( TempDeletedata[dd].jobID );
        }
        var  query=[];
        if(compaignId!=""){
          query.push({$match: { campaignID: { $eq: compaignId } } }) ;
        }
        if(deletedJobIds.length > 0){
          query.push({$match: { id: { $nin: deletedJobIds } } }) ;
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
        if(true){
          criteria.push({ 'job_active_stage.status':{"$ne":"Cancelled" }});
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
        // var limit={ $limit : currentPage * rowsPage };
        // if(currentPage -1 >0){
        // var skip= {$skip: (currentPage -1)* rowsPage};
        // query.push(skip);
        // }else{
        //   query.push({$skip: 0});
        // }
        // query.push( limit);
    console.log(" Export Xml action: Query data is :", JSON.stringify(query));
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
                  if(result[key].hasOwnProperty('jobMetaproperties')){
                    var data={};
                    for(var key2 in result[key].jobMetaproperties){
                        for(var dt in rs){
                        if(rs[dt].tempId==key2){
                          result[key].jobMetaData.push({label: rs[dt].label, tempId: rs[dt].tempId,options: rs[dt].options});
                          }
                        }
                    } 
                  }
               }
                res.send(JSON.stringify(result));
              });
              
          }
        });    
    }).catch((Err)=>{
      console.log("not able to fetch Data from delete_temp_data error is "+Err);
    }); 
});


//---
postRoutes.route('/getoverduejobs').post(function (req, res) {
  console.log("getoverduejobs =>", req.body);
  var overDueIDs;
  if(req.body.overDueIDs){ 
    overDueIDs=req.body.overDueIDs; 
    var query = [];
    var lookupOvrdue = { $lookup : 
      { "from" : "campaign", "localField" : "campaignID", "foreignField" : "ID","as" : "campaignJoin"}};
      query.push(lookupOvrdue);
   var queryfind={"$match":{id: {
        $in: overDueIDs
    }}};
    query.push(queryfind);
    var project={ 
      $project:  {campaignID:1, "campaignJoin.name":1 ,  name:1, job_key:1, job_duration:1, dateCreated:1, job_date_finished:1}
    };
    query.push(project);
    console.log(query);
  // Mdb.bynder_jobs.find(query,{campaignID:1,  name:1, job_key:1, job_duration:1, job_date_started:1, job_date_finished:1})
  Mdb.bynder_jobs.aggregate([query]).then((docs)=>{
    res.send(docs);
   }).catch((Err)=>{
    console.log("Error at overdue jobs");
   });
  }
});

postRoutes.route('/scorecarddata').post(function (req, res) {
  // let compaignId = req.params.compaignId;
   
   console.log("scorecarddata" , "data comming ..=>", req.body);
   let workflowPreset="", compaignId ="",jobType="",
   grade="", modules="", startDateRange="", endDateRange="", currentStatus="", jobTypeTemp="";
     if(req.body.workflowPreset){ workflowPreset=req.body.workflowPreset; }
     if(req.body.compaignId){ compaignId=req.body.compaignId; }
     if(req.body.jobType){ jobType=req.body.jobType.split("-").join(""); jobTypeTemp=req.body.jobType; }
     if(req.body.grade){ grade=req.body.grade.split("-").join(""); }
     if(req.body.modules){ modules=req.body.modules.split("-").join(""); }
     if(req.body.startDateRange){ startDateRange=req.body.startDateRange; }
     if(req.body.endDateRange){ endDateRange=req.body.endDateRange; }
     if(req.body.currentStatus){ currentStatus=req.body.currentStatus; }
     var startDate="", endDate="";
     if(endDateRange!="" && endDateRange.indexOf(" - ")!=-1){
      var dt= endDateRange.split(" - ");
      startDate= sCheckIN=dt[0];
      endDate=sCheckOut=dt[1];
    }
    if(startDateRange!="" && startDateRange.indexOf(" - ")!=-1){
      var dt= startDateRange.split(" - ");
      startDate= sCheckIN=dt[0];
      endDate=sCheckOut=dt[1];
    }
    console.log("mmmmm=======>",workflowPreset=="" ,compaignId=="", jobType=="" ,grade=="",modules=="", currentStatus.length==0 ,startDate=="" , endDate=="" );
    if(workflowPreset=="" && compaignId=="" && jobType=="" &&grade==""&&modules==""&& currentStatus.length==0 &&startDate=="" && endDate==""){
        currentStatus.push("Active");
        console.log("Without-filter");
      }
      let Searchcriteria=[];
      if(workflowPreset){ Searchcriteria.push( {"joincollection1.name": {"$regex":new RegExp(".*"+workflowPreset+".*") }  } ); }
      if(compaignId){  Searchcriteria.push( {"campaignID": compaignId } );  }
      if(jobType){  Searchcriteria.push({ "jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c": jobType });  }
      if(grade){ Searchcriteria.push({ "jobMetaproperties.c0ac0a86e65f4f7ebd88dbd7e77965ef": grade }); }
      if(modules){ Searchcriteria.push({ "jobMetaproperties.7388493928bc4a9aa57ca65306ed1579": modules });}
      if(currentStatus && currentStatus.length >0 ){ 
        Searchcriteria.push({ "job_active_stage.status":{'$in': currentStatus }}); 
      }
      if(startDate){
        Searchcriteria.push({ "dateCreated": {$gte: new Date(startDate)} });
      }
      if(endDate){
        Searchcriteria.push({ "job_date_finished": {$lte: new Date(endDate) } });
      }
      let pipeline=[];
      pipeline.push( 
      {"$lookup":{"localField":"campaignID","from":"campaign","foreignField":"ID","as":"joincollection"}}
      );
      pipeline.push( 
        {"$lookup":{"localField":"presetID","from":"job_presets","foreignField":"ID","as":"joincollection1"}}
        );
        let forOverDueQuery=Searchcriteria;
      if(Searchcriteria.length > 0){
        Searchcriteria =  {$and: Searchcriteria };
        pipeline.push(  { $match: Searchcriteria });
        //pipeline.push(Searchcriteria );
      }
      
      pipeline.push( {"$group" : {_id: {
         "campaignID":"$campaignID" , "compName":"$joincollection.name", 
          "status":"$job_active_stage.status"   },  count:{$sum:1} } } );
         console.log('\x1b[31m',"All count of Query :", JSON.stringify(pipeline));
 
       Mdb.bynder_jobs.aggregate( pipeline, function (err, result) {
         if (err) { console.log(err); next(err);} else {
           let dumpCampIds=[];
           for (var keys in result) {
             if(dumpCampIds.indexOf(result[keys]._id.campaignID) != -1){
               dumpCampIds.push(result[keys]._id.campaignID);
             }
           }
          //   var TATquery="";
          //  if(workflowPreset!="Permission" && workflowPreset!=""){
          //     TATquery={asset_typeId: workflowPreset};
          //  }else{
          //     if(jobTypeTemp==""){
          //       jobTypeTemp="05dedb54-4418-4ea7-89c6-18ef1d188bd5";
          //     }
          //     TATquery={asset_typeId: jobTypeTemp};
          //  }
          //  console.log('\x1b[31m',"TaTQuery :", JSON.stringify(TATquery));
          // Mdb.overdue_jobs.find(TATquery).then((tatres)=>{
          //  console.log("TaT In Day is:",tatres[0].tat); 
          //  let overdueQuery=[];
          //  let overLookup1={"$lookup":{"localField":"presetID","from":"job_presets","foreignField":"ID","as":"joincollection1"}};
          //  overdueQuery.push(overLookup1);
      
          //   forOverDueQuery.push({job_duration: {$gte: tatres[0].tat+" days 00:00:00"}});
          //   if(forOverDueQuery.length > 0){
          //     forOverDueQuery =  {$and: forOverDueQuery }; 
          //     overdueQuery.push({ $match: forOverDueQuery });
          //   }
          //  overdueQuery.push({ $group: { _id: "", overDueJobs: { $sum: 1 } } });
          //  console.log('\x1b[31m',"overdueQuery :", JSON.stringify(overdueQuery));
          //  Mdb.bynder_jobs.aggregate(overdueQuery)
          //  .then((doc)=>{
            
          //   var overDueJobs=0;  
          //   if(doc.length>0 && doc[0].hasOwnProperty("overDueJobs")){
          //     overDueJobs=doc[0].overDueJobs;
          //   } 
          //   console.log("\x1b[32m data is comming:" , doc, overDueJobs);
          
          // }).catch((Err)=>{
          //   console.log("data Error:",Err );
          // });
          var dataResult={
            chartData1and2: result,
            //overDueJobs: overDueJobs,
           //TATdata:tatres
          };
          res.send(dataResult);
          //  }).catch((Err)=>{
          //   console.log("Error to fetch data Mdb.bynder_jobs:", Err);
          //  });
         }
       });
 });
 postRoutes.route('/scorecardload').post(async function(req, res, next) {
  console.log("scorecardload" , "data comming ..=>", req.body);
  
  var workflowPreset="", compaignId ="",jobType="",
  grade="", modules="", startDateRange="", endDateRange="", currentStatus="", jobTypeTemp="";
    if(req.body.workflowPreset){ workflowPreset=req.body.workflowPreset; }
    if(req.body.compaignId){ compaignId=req.body.compaignId; }
    if(req.body.jobType){ jobType=req.body.jobType.split("-").join(""); }
    if(req.body.grade){ grade=req.body.grade.split("-").join(""); }
    if(req.body.modules){ modules=req.body.modules.split("-").join(""); }
    if(req.body.startDateRange){ startDateRange=req.body.startDateRange; }
    if(req.body.endDateRange){ endDateRange=req.body.endDateRange; }
    if(req.body.currentStatus){ currentStatus=req.body.currentStatus; }
    
    var startDate="", endDate="";

    if(endDateRange!="" && endDateRange.indexOf(" - ")!=-1){
      var dt= endDateRange.split(" - ");
      startDate= sCheckIN=dt[0];
      endDate=sCheckOut=dt[1];
    }
    if(startDateRange!="" && startDateRange.indexOf(" - ")!=-1){
      var dt= startDateRange.split(" - ");
      startDate= sCheckIN=dt[0];
      endDate=sCheckOut=dt[1];
    }
    if(workflowPreset==""&& compaignId=="" &&jobType=="" &&grade==""&&modules==""&& currentStatus.length==0 &&startDate=="" && endDate==""){
      currentStatus.push("Active");
    }
    var resultData=[];
    var count=0;
    let PermissionsData=['Permission','Created Image','Shutterstock','Clip Art'];
    var permissionResponce=[];
    var serchFilter=[];
    var Query=[];
    if(compaignId){ serchFilter.push({ "campaignID": compaignId });  }
    if(jobType){ serchFilter.push({ "jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c": jobType }); }
    if(grade){ serchFilter.push({ "jobMetaproperties.c0ac0a86e65f4f7ebd88dbd7e77965ef": grade }); }
    if(modules){ 
      serchFilter.push({ "jobMetaproperties.7388493928bc4a9aa57ca65306ed1579": modules }); 
    }
    if(startDate){ 
      serchFilter.push({ "dateCreated":{"$gte": new Date( startDate )}  }); 
    }
    if(endDate){ 
      serchFilter.push({ "job_date_finished":{"$lte": new Date( endDate ) }  }); 
    }
    if(currentStatus && currentStatus.length >0 ){ 
      serchFilter.push({ "job_active_stage.status":{'$in': currentStatus }}); 
    }
    var allJobsMatch=serchFilter;
    var project={ 
      $project:  { 'id':1, 
        'dateCreated':1,  
        "dateCompleted": "$job_date_finished",
        'job_duration':1
      }
    };
    var lookup1=  {"$lookup":{"localField":"presetID","from":"job_presets","foreignField":"ID","as":"joincollection"}};
    Query.push(lookup1);

    if(workflowPreset){ 
      serchFilter.push({ "joincollection.name":{"$regex":new RegExp(".*"+workflowPreset+".*") } }); 
    }
    console.log("Query data  ==>", Query);
    
    if(!workflowPreset){
        for( let temp in PermissionsData){
         // console.log("Serach Data is  ==>", serchFilter);
          
          let serchFilterUnder=[];
          for(let tt in serchFilter){
            serchFilterUnder.push(serchFilter[tt] ) ;
          }
          //serchFilter;
          let Query2=[lookup1];
          serchFilterUnder.push( { "joincollection.name": {"$regex": new RegExp(".*"+PermissionsData[temp]+".*") } } ); 
          Query2.push(  { $match: { $and: serchFilterUnder } });
          Query2.push(project);
          console.log("without Preset data==>", JSON.stringify(Query2));
            await  Mdb.bynder_jobs.aggregate(Query2).then((res)=>{
              for(let key in res){  
                res[key].duration= res[key].job_duration;//dateDiffC(res[key].dateCompleted, res[key].dateCreated);
              }
              permissionResponce.push({ "data" : res, "permission": PermissionsData[temp] } );
            }).catch((Err)=>{
              console.log("Error in permission data", Err);
            }); 
      }
    }else{
      console.log("data finding testing ================>");
      if(serchFilter.length > 0){
        serchFilter = serchFilter.length > 0 ? { $and: serchFilter } : {};
        Query.push(  { $match: serchFilter });
      }
      /* eslint-disable */ 
      Query.push(project);
          console.log("Dynamic Search Query==>", JSON.stringify(Query));
          //throw new Error('your die message here');
          await  Mdb.bynder_jobs.aggregate(Query).then((res)=>{
            for(let key in res){
              res[key].duration= dateDiffC(res[key].dateCompleted, res[key].dateCreated);
            }
            permissionResponce.push({ "data" : res, "permission": workflowPreset } );
          }).catch((Err)=>{
            console.log("Error in permission data", Err);
          });
    }
    var docs='';
      await Mdb.bynder_jobs.aggregate([ {"$group" : {_id: { "status":"$job_active_stage.status"},  count:{$sum:1} } }])
        .then((docs)=>{
        var data={ GraphCreatedJobs: resultData, jobsStatus:docs, permissionResponce:permissionResponce };
        res.send(data);
      }).catch((Err)=>{
        console.log("Error in groops");
      });

     // let overdueQuery=[];
    //   if(req.body.workflowPreset){ workflowPreset=req.body.workflowPreset; }
    // if(req.body.compaignId){ compaignId=req.body.compaignId; }

    //if(req.body.jobType){ jobTypeTemp=req.body.jobType; }

    // if(req.body.grade){ grade=req.body.grade.split("-").join(""); }
    // if(req.body.modules){ modules=req.body.modules.split("-").join(""); }
    // if(req.body.startDate){ startDate=req.body.startDate; }
    // if(req.body.endDate){ endDate=req.body.endDate; }
    // if(req.body.currentStatus){ currentStatus=req.body.currentStatus; }
    // TatQuery={asset_typeId:'05dedb54-4418-4ea7-89c6-18ef1d188bd5'};
    // var TatQuery="";
    //   if(workflowPreset==""){
    //     var OverDueData=[];
    //     for(let k in PermissionsData){
    //       var overdueQ=[],QueryTat;
    //       if(PermissionsData[k]=="Permission"){
    //         QueryTat={"asset_typeId":'05dedb54-4418-4ea7-89c6-18ef1d188bd5'};
    //       }else{
    //         QueryTat={"asset_typeId":PermissionsData[k]};
    //       }
    //       var tat=0;
    //       await Mdb.overdue_jobs.find(QueryTat).then((tatData)=>{
    //         tat= tatData[0].tat
    //       }).catch((Err)=>{
    //         console.log("ERror", QueryTat);
    //       });
          
    //       var overDueQuery=[{"$lookup":{"localField":"presetID","from":"job_presets","foreignField":"ID","as":"joincollection1"}},
    //       {"$match":
    //       {"$and":[
    //          {"job_duration":{"$lte":tat+" days 00:00:00"}},
    //          {"joincollection1.name":{$regex : new RegExp(".*"+PermissionsData[k]+".*") }}
    //       ]}},{
    //         $group: { _id: "", overDueCount: { $sum: 1 } }
    //       }];
    //       console.log("Query for Overdue data",JSON.stringify(overDueQuery) );
    //       await Mdb.overdue_jobs.aggregate(overDueQuery).then((overDueRes)=>{
    //         //console.log("overDueRes", PermissionsData[temp] ,"===>", overDueRes);
    //         OverDueData.push({teams: PermissionsData[k], overDueData:overDueRes[0].overDueCount });
    //       }).catch((Err)=>{
    //         console.log("Err in OverDue data", PermissionsData[k]);
    //       });
    //     }
    //     console.log("overdue DAta ios ". OverDueData); 
    //     res.send(OverDueData);
    //   }
      
   //{"$regex":
 });
postRoutes.route('/medianoverdueperteam').post(async function(req, res, next) {
  console.log("\x1b[34m createdcompletedjobs =>", req.body);
 
  var workflowPreset="", compaignId ="",jobType="",
  grade="", modules="", startDate="", endDate="",startDateRange="", endDateRange="", currentStatus="", jobTypeTemp="";
    if(req.body.workflowPreset){ workflowPreset=req.body.workflowPreset; }
    if(req.body.compaignId){ compaignId=req.body.compaignId; }
    if(req.body.jobType){ jobType=req.body.jobType.split("-").join(""); }
    if(req.body.jobType){ jobTypeTemp=req.body.jobType;}
    if(req.body.grade){ grade=req.body.grade.split("-").join(""); }
    if(req.body.modules){ modules=req.body.modules.split("-").join(""); }
    if(req.body.startDateRange){ startDateRange=req.body.startDateRange; }
    if(req.body.endDateRange){ endDate=req.body.endDateRange; }
    if(req.body.currentStatus){ currentStatus=req.body.currentStatus; }
    let sCheckIN,sCheckOut, eCheckIn, eCheckOut;
    var startDate="", endDate="";
    if(endDateRange!="" && endDateRange.indexOf(" - ")!=-1){
      var dt= endDateRange.split(" - ");
      startDate= sCheckIN=dt[0];
      endDate=sCheckOut=dt[1];
    }
    if(startDateRange!="" && startDateRange.indexOf(" - ")!=-1){
      var dt= startDateRange.split(" - ");
      startDate= sCheckIN=dt[0];
      endDate=sCheckOut=dt[1];
    }

    var GTat=0;

    var TatQuery=""; var OverDueData=[];
      var GMatchFilter=[];
      if(compaignId){ GMatchFilter.push({ "campaignID": compaignId });  }
      if(grade){ GMatchFilter.push({ "jobMetaproperties.c0ac0a86e65f4f7ebd88dbd7e77965ef": grade }); }
      if(modules){ GMatchFilter.push({ "jobMetaproperties.7388493928bc4a9aa57ca65306ed1579": modules });}
      if(startDate){ GMatchFilter.push({ "jobMetaproperties.e9074f5b472f41d4a92ac511e53da775":{"$gte": startDate}});}
      if(endDate){ GMatchFilter.push({ "jobMetaproperties.57046bf7e7624ab5bc4b8e16664b4cf8":{"$lte": endDate}});}
      if(currentStatus && currentStatus.length >0 ){ GMatchFilter.push({ "job_active_stage.status":{'$in': currentStatus }});}
      //if(workflowPreset){ GMatchFilter.push({"joincollection1.name":{$regex : new RegExp(".*"+PermissionsData[k]+".*") }}); }
      
      if(workflowPreset!=""){
        var QueryTat;
        var OverDueData=[];
        if(workflowPreset!="Permission"){
          QueryTat={"asset_typeId":workflowPreset};
        }else{
          if(jobTypeTemp){
            QueryTat={"asset_typeId":jobTypeTemp};
          }else{
            QueryTat={"asset_typeId":'05dedb54-4418-4ea7-89c6-18ef1d188bd5'};
          }
        }
          var tat=0; 
          console.log("\x1b[34m Query for Overdue data",JSON.stringify(QueryTat) );
          await Mdb.overdue_jobs.find(QueryTat).then((tatData)=>{
            tat= tatData[0].tat
          }).catch((Err)=>{
            console.log("ERror", QueryTat);
          });
          GTat=tat;
          GMatchFilter.push({"job_durationDay":{"$gte":tat}});
          GMatchFilter.push({"joincollection1.name":{$regex : new RegExp(".*"+workflowPreset+".*") }});
          if(jobTypeTemp){ GMatchFilter.push({ "jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c": jobType }); }
          var overDueQuery=[{"$lookup":{"localField":"presetID","from":"job_presets","foreignField":"ID","as":"joincollection1"}}];
          if(GMatchFilter.length > 0){
            GMatchFilter = GMatchFilter.length > 0 ? { $and: GMatchFilter } : {};
            overDueQuery.push(  { $match: GMatchFilter });
          }
          var group={ $group: { _id: "", overDueCount: { $sum: 1 }, overDueIds: {$push: "$id"} , "jobDuration":{"$push": "$job_duration" }}};
          overDueQuery.push(group);
          console.log("\x1b[34m Query for Overdue data",JSON.stringify(overDueQuery) );
          await Mdb.bynder_jobs.aggregate(overDueQuery).then((overDueRes)=>{
           // console.log("overDueRes", workflowPreset ,"===>", overDueRes);
            var overDueCount=0, overDueIds=[], jobDuration=[];
            if(overDueRes.length > 0 && overDueRes[0].hasOwnProperty('overDueCount')){
               overDueCount=overDueRes[0].overDueCount;
               overDueIds=overDueRes[0].overDueIds;
               jobDuration=overDueRes[0].jobDuration;
            }
            
            OverDueData.push({teams: workflowPreset, overDueCount:overDueCount, overDueIds:overDueIds, jobDuration:jobDuration });
            console.log(overDueRes.length,JSON.stringify(overDueRes));
          }).catch((Err)=>{
            console.log("Err in OverDue data", PermissionsData[k]);
          });
      }else{
        let PermissionsData=['Created Image','Shutterstock','Clip Art'];
        for(let k in PermissionsData){
          var GlobalFiltes=[];
          // for(let tt in GMatchFilter){
          //   GlobalFiltes.push(GMatchFilter[tt] ) ;
          // }
          var overdueQ=[],QueryTat;
          if(PermissionsData[k]=="Permission"){
           // QueryTat={"asset_typeId":'05dedb54-4418-4ea7-89c6-18ef1d188bd5'};
          }else{
            QueryTat={"asset_typeId":PermissionsData[k]};
          }
          var tat=0; 
          await Mdb.overdue_jobs.find(QueryTat).then((tatData)=>{
            tat= tatData[0].tat
          }).catch((Err)=>{
            console.log("ERror", QueryTat);
          });
          var overDueQuery=[{"$lookup":{"localField":"presetID","from":"job_presets","foreignField":"ID","as":"joincollection1"}}];
          var matchFilter=[];
          for(let tt in GlobalFiltes){
            matchFilter.push(GlobalFiltes[tt]);
          }
          //matchFilter=GlobalFiltes;
          matchFilter.push({ "job_active_stage.status":{'$in': ['Active'] }});
          matchFilter.push({"job_durationDay":{"$gte":tat}});
          matchFilter.push({"joincollection1.name":{$regex : new RegExp(".*"+PermissionsData[k]+".*") }});
          if(matchFilter.length > 0){
            matchFilter = matchFilter.length > 0 ? { $and: matchFilter } : {};
            overDueQuery.push(  { $match: matchFilter });
          }
          var group={ $group: { _id: "", overDueCount: { $sum: 1 }, overDueIds: {$push: "$id"} , "jobDuration":{"$push": "$job_duration" } }};
          overDueQuery.push(group);
          console.log("\x1b[34m Query for Overdue data",JSON.stringify(overDueQuery) );
          
          await Mdb.bynder_jobs.aggregate(overDueQuery).then((overDueRes)=>{
           // console.log("overDueRes", PermissionsData[k] ,"===>", overDueRes);
            var overDueCount=0, overDueIds=[], jobDuration=[];
            if(overDueRes.length > 0 && overDueRes[0].hasOwnProperty('overDueCount')){
               overDueCount=overDueRes[0].overDueCount;
               overDueIds=overDueRes[0].overDueIds;
               jobDuration=overDueRes[0].jobDuration;
            }
            
            OverDueData.push({teams: PermissionsData[k], overDueCount:overDueCount, overDueIds:overDueIds, jobDuration:jobDuration});
            console.log(overDueRes.length,overDueRes);
          }).catch((Err)=>{console.log("Err in OverDue data", PermissionsData[k]);});
        }
        // for permission overdue data
        var IDS=[], QuerysPermission=[];
        await Mdb.metaproperties.find({ID:'262f92ed-59b1-4c3a-a74d-6877d7f8ba4c'},{"options.ID":1}).then((Data)=>{
          console.log("All Tat Catatory data=",Data[0].options);
          for(let k in Data[0].options){
              if(Data[0].options[k].ID && Data[0].options[k].ID!="")
              IDS.push(Data[0].options[k].ID);
          }
        }).catch((Err)=>{
          console.log("Err in get permission voderdue TAT");
        });
        await Mdb.overdue_jobs.find({
              asset_typeId: {
                  $in: IDS
              }
          },{asset_typeId:1, asset_type:1, tat:1}).then((docs)=>{
            console.log("overdue data TAT is", docs);
            for(let dt in docs){
                var overDueQuery=[{"$lookup":{"localField":"presetID","from":"job_presets","foreignField":"ID","as":"joincollection1"}}];
                var matchFilter=[];
                for(let tt in GlobalFiltes){
                  matchFilter.push(GlobalFiltes[tt]);
                }
                matchFilter.push({ "job_active_stage.status":{'$in': ['Active'] }});
                matchFilter.push({"job_durationDay":{"$gte": docs[dt].tat }});
                matchFilter.push({"joincollection1.name":{$regex : new RegExp(".*Permission.*") }});
                matchFilter.push({"jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c": docs[dt].asset_typeId.split("-").join("") });
                if(matchFilter.length > 0){
                  matchFilter = matchFilter.length > 0 ? { $and: matchFilter } : {};
                  overDueQuery.push(  { $match: matchFilter });
                }
                var group={ $group: { _id: "", overDueCount: { $sum: 1 }, overDueIds: {$push: "$id"} , "jobDuration":{"$push": "$job_duration" } }};
                overDueQuery.push(group);
                QuerysPermission.push(overDueQuery);

            }
          }).catch((Err)=>{ console.log("Err in permission var tat", Err); });

       for (let kk in QuerysPermission){
        console.log("\x1b[34m Query for Overdue data for PermissionsData",JSON.stringify(QuerysPermission[kk])  );
               
        await Mdb.bynder_jobs.aggregate(QuerysPermission[kk]).then((overDueRes)=>{
          //console.log("overDueRes Permissions","===>", overDueRes);
          var overDueCount=0, overDueIds=[], jobDuration=[];
          if(overDueRes.length > 0 && overDueRes[0].hasOwnProperty('overDueCount')){
             overDueCount=overDueRes[0].overDueCount;
             overDueIds=overDueRes[0].overDueIds;
             jobDuration=overDueRes[0].jobDuration;
          }
          OverDueData.push({teams: "Permission", overDueCount:overDueCount, overDueIds:overDueIds, jobDuration:jobDuration});
        //  console.log(overDueRes.length,JSON.stringify(overDueRes));
        }).catch((Err)=>{ console.log("Err in OverDue data Permissions", Err);});
       }
                  // await Mdb.bynder_jobs.aggregate(overDueQuery).then((overDueRes)=>{

        

      }
     // console.log("ddddd=>", JSON.stringify(OverDueData) );
      var rsdata={GTat:GTat, OverDueData:OverDueData};
      res.send(rsdata);
});

 postRoutes.route('/createdcompletedjobs').post(async function(req, res, next) {
  console.log("createdcompletedjobs =>", req.body);
  var workflowPreset="", compaignId ="",jobType="",
  grade="", modules="", startDate="", endDate="",startDateRange="", endDateRange="", currentStatus="", jobTypeTemp="";
    if(req.body.workflowPreset){ workflowPreset=req.body.workflowPreset; }
    if(req.body.compaignId){ compaignId=req.body.compaignId; }
    if(req.body.jobType){ jobType=req.body.jobType.split("-").join(""); }
    if(req.body.grade){ grade=req.body.grade.split("-").join(""); }
    if(req.body.modules){ modules=req.body.modules.split("-").join(""); }
    if(req.body.startDateRange){ startDateRange=req.body.startDateRange; }
    if(req.body.endDateRange){ endDate=req.body.endDateRange; }
    if(req.body.currentStatus){ currentStatus=req.body.currentStatus; }
    let sCheckIN,sCheckOut, eCheckIn, eCheckOut;
    if(endDateRange!="" && endDateRange.indexOf(" - ")!=-1){
      var dt= endDateRange.split(" - ");
      startDate= sCheckIN=dt[0];
      endDate=sCheckOut=dt[1];
    }
    if(startDateRange!="" && startDateRange.indexOf(" - ")!=-1){
      var dt= startDateRange.split(" - ");
      startDate= sCheckIN=dt[0];
      endDate=sCheckOut=dt[1];
    }
    if(startDate){  dt= new Date(startDate); }else{ dt=new Date(); dt.setDate(dt.getDate()-98); }
    let dateTimes = dt;
    if(endDate){ curDate =new Date(endDate); }else{  curDate =new Date();  }
    var resultData=[];
    var count=0;
    let PermissionsData=['Permission','Created Image','Shutterstock','Clip Art'];

    console.log( " date start and end < ",dateTimes.getTime() , curDate.getTime());
   // Mdb.createView();

    while (dateTimes.getTime() < curDate.getTime()){
      var OldDate=MpsDateFormat(dateTimes);
      dateTimes.setDate(dateTimes.getDate() + 7);
      var NewDate=MpsDateFormat(dateTimes);
      var Searchcriteria=[{"dateCreated":{"$gte" : new Date(OldDate) }}, { "dateCreated":{"$lte" : new Date(NewDate +"T24:00:00") }} ];
      var Searchcriteria2=[
        {"job_date_finished":{"$gte" : new Date(OldDate ) }},
        { "job_date_finished":{"$lte" : new Date(NewDate +"T24:00:00" )}}
      ];
      Searchcriteria.push({"job_active_stage.status":{"$ne":"Cancelled"}});
      //var lookup2= {"$lookup":{"localField":"jobID","from":"ExportSheetData","foreignField":"job_id","as":"joincollection"}};
      var lookup2= {"$lookup":{"localField":"presetID","from":"job_presets","foreignField":"ID","as":"joincollection"}};
      var CreatedQuery=[lookup2];
      var FinishedQuery=[lookup2];
      if(workflowPreset){ 
        console.log("workflowPreset data is :", workflowPreset);
        Searchcriteria.push({ "joincollection.name":{"$regex":new RegExp(".*"+workflowPreset+".*") } }); 
        Searchcriteria2.push({ "joincollection.name":{"$regex":new RegExp(".*"+workflowPreset+".*") } }); 
      }
      if(compaignId){ 
        Searchcriteria.push({ "campaignID": compaignId }); 
        Searchcriteria2.push({ "campaignID": compaignId }); 
      }
      if(jobType){ 
        Searchcriteria.push({ "jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c": jobType }); 
        Searchcriteria2.push({ "jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c": jobType }); 
      }
      if(grade){ 
        Searchcriteria.push({ "jobMetaproperties.c0ac0a86e65f4f7ebd88dbd7e77965ef": grade }); 
        Searchcriteria2.push({ "jobMetaproperties.c0ac0a86e65f4f7ebd88dbd7e77965ef": grade });
      }
      if(modules){ 
        Searchcriteria.push({ "jobMetaproperties.7388493928bc4a9aa57ca65306ed1579": modules }); 
        Searchcriteria2.push({ "jobMetaproperties.7388493928bc4a9aa57ca65306ed1579": modules }); 
      }
      if(currentStatus && currentStatus.length >0 ){ 
        Searchcriteria.push({ "job_active_stage.status":{'$in': currentStatus }}); 
        Searchcriteria2.push({ "job_active_stage.status":{'$in': currentStatus }});
      }
      if(Searchcriteria.length > 0){
        Searchcriteria = Searchcriteria.length > 0 ? { $and: Searchcriteria } : {};
        CreatedQuery.push(  { $match: Searchcriteria });
      }
      if(Searchcriteria2.length > 0){
        Searchcriteria2 = Searchcriteria2.length > 0 ? { $and: Searchcriteria2 } : {};
        FinishedQuery.push(  { $match: Searchcriteria2 });
      }
      CreatedQuery.push(  { $count: "count"} );
      FinishedQuery.push(  { $count: "count"} );
        var qdata= await getMongoData(CreatedQuery, OldDate, NewDate );//Mdb.bynder_jobs.aggregate(CreatedQuery, OldDate, NewDate);
        var FinishedData= await getFinshedDate( FinishedQuery, OldDate, NewDate  );
        resultData.push( { CreatedJobs:qdata, FinishedJobs: FinishedData} );
        console.log("\nCreated:", JSON.stringify(CreatedQuery), "\nFinishedQuery:", JSON.stringify(FinishedQuery));
        dateTimes.setDate(dateTimes.getDate() ); //+ 1
    }
    console.log(JSON.stringify(resultData));
    res.send(resultData);
 });
module.exports = postRoutes;

async function  getMongoData( query ,OldDate, NewDate){
  var data='';
  await Mdb.bynder_jobs.aggregate(query).then((result)=>{
    data=result;
    if(data.length>0){
      data[0].OldDate=OldDate;
      data[0].NewDate=NewDate;
      
     }else{
      data=[{count:0, OldDate:OldDate , NewDate:NewDate }];
    }
  }).catch((Err)=>{
    console.log("Query Error is ", Err);
  });
  return data;
}
async function getFinshedDate(query ,OldDate, NewDate){
  var data='';
  await Mdb.bynder_jobs.aggregate(query).then((result)=>{
    data=result;
    if(data.length>0){
      data[0].OldDate=OldDate;
      data[0].NewDate=NewDate;
     }else{
      data=[{count:0, OldDate:OldDate , NewDate:NewDate }];
    }
  }).catch((Err)=>{
    console.log("Query Error is ", Err);
  });
  return data;
}
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
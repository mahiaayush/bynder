const express = require('express');
const postRoutes = express.Router();
const request = require('request');
const OAuth   = require('oauth-1.0a');
const crypto  = require('crypto');
const await = require("await");
const async = require("async");
let Mdb = require('./post.model');
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
  let pipeline = [{
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
// --- Job card view action data 
postRoutes.route('/getJobByKey/').post(function (req, res) {
  console.log("\n\n ACTION getJobByKey data=>", JSON.stringify(req.body));
  let job_key='';
  if(req.body.job_key ){
    job_key=req.body.job_key;

  }
  let query=[{"$project":{"presetstages":1,"presetName":1,"isUpdated":1,"impact":1,"risk":1,"job_key":1,"id":1,"jobMetaproperties":1,"name":1,"job_duration":1,"job_date_finished":1,"dateCreated":1,"job_active_stage":1,"presetID":1,"createdByID":1,"campaignID":1,"jobID":1,"Preset_Stages":1,
    "CalDuration":{"$cond":{"if":{"$eq":["$job_date_finished",""]},"then":{"$divide":[{"$subtract":[new Date(),"$dateCreated"]},86400000]},
    "else":{"$cond":{"if":{"$eq":["$job_date_finished",null]},
    "then":{"$divide":[{"$subtract":[new Date(),"$dateCreated"]},86400000]},
    "else":{"$divide":[{"$subtract":["$job_date_finished","$dateCreated"]},86400000]}}}}}}},
    {"$lookup":{"localField":"campaignID","from":"campaign","foreignField":"ID","as":"joincollection3"}},
    {$match: {job_key : job_key}}];
    console.log("Query: ==>", JSON.stringify( query));
    Mdb.bynder_jobs.aggregate( query ).then((result)=>{
      
      //res.send( data); 
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
             var queryRes={rowCount:1, rows: result};
             res.send(JSON.stringify(queryRes));
            });
    
    }).catch((Err)=>{ console.log("Err in find", query);});
});
postRoutes.route('/getjobsbycampaignid/').post(function (req, res) {

  console.log("\n\n ACTION getjobsbycampaignid data=>", JSON.stringify(req.body));
  var deletedJobIds=new Array();
  Mdb.delete_temp_data.find({},{ jobID:1}).then((deleteTempData)=>{
   for(let ddd; ddd < deleteTempData.length; ddd++){
      deletedJobIds.push(deleteTempData[ddd].jobID);
    }
  let compaignId ="", workflowPreset="", currentStatus=[] , jobType="",jobTypeID="", startDate="", endDate="",modules='',
  grade='', currentPage=1,rowsPage=10, isOverdue=false;
  if(req.body.currentPage){ currentPage= req.body.currentPage; }
  if(req.body.rowsPage){ rowsPage= req.body.rowsPage; }
  if(req.body.compaignId){ compaignId=req.body.compaignId; }
  if(req.body.workflowPreset){ workflowPreset=req.body.workflowPreset; }
  if(req.body.currentStatus ){
    currentStatus=req.body.currentStatus;
    var neWcurrentStatus=[]; 
    if(currentStatus.length > 0 ){
      for(let temp=0; temp< currentStatus.length; temp++ ){
        if( currentStatus[temp] != 'Overdue'){
          neWcurrentStatus.push( currentStatus[temp] );
        }
        if( currentStatus[temp] == 'Overdue'){
          isOverdue=true; 
        }
        if( currentStatus.indexOf('Overdue')>-1 &&   currentStatus.indexOf('Approved') == -1 ){
          neWcurrentStatus.push("Active");
          neWcurrentStatus.push("NeedsChanges");
        }
      }
    }
    currentStatus=neWcurrentStatus;
  }
  if(req.body.jobType ){ jobType=req.body.jobType.split("-").join(""); jobTypeID=req.body.jobType; }
  if(req.body.modules ){
    modules=req.body.modules.split("-").join("");
  }
  if(req.body.grade ){ grade=req.body.grade.split("-").join(""); }
  if(req.body.startDate ){ startDate=req.body.startDate; }
  if(req.body.endDate ){ endDate=req.body.endDate; }
  var dt, frmDate, toDate;
  //console.log("getjobsbycampaignid", req.body, "date Range ", startDate,"::",  endDate);
  var  query=[];
  if(compaignId!=""){
    query.push({$match: { campaignID: { $eq: compaignId } } }) ;
  }
  if(deletedJobIds.length > 0){
    query.push({$match: { id: { $nin: deletedJobIds } } }) ;
  }
  //var  lookup1={ $lookup:{ localField: "presetID",  from: "job_presets", foreignField : "ID",as: "joincollection"}};
  //var lookup2={ $lookup:{ localField: "joincollection.presetstages.responsibleID", from: "users", foreignField : "ID", as: "joincollection2"}};
  var lookup3={ $lookup:{ localField: "campaignID", from:"campaign",foreignField : "ID", as: "joincollection3" }};
  //var  lookup4={"$lookup":{"localField":"jobID","from":"ExportSheetData","foreignField":"job_id","as":"joincollection4"}};
  var project={"$project":{"presetstages":1, "presetName":1,"isUpdated":1,"impact":1, "risk": 1, "job_key":1,"id":1,"jobMetaproperties":1,"name":1, "job_duration":1,"job_date_finished":1,"dateCreated":1, "job_active_stage":1,"presetID":1,"createdByID":1,"campaignID":1,"jobID":1,
  "jobMetaproperties":1, "Preset_Stages":1,
  "CalDuration":{"$cond":{"if": {"$eq":["$job_date_finished",""]} ,"then":{"$divide":[{"$subtract":[new Date(),"$dateCreated"]},86400000]},
        "else":{
          "$cond":{"if": {"$eq":["$job_date_finished",null]}, "then":  {"$divide":[{"$subtract":[new Date(),"$dateCreated"]},86400000]},
            "else": {"$divide":[{"$subtract":["$job_date_finished","$dateCreated"]}, 86400000]}
          }
        }}}
  }};
   // console.log("Projection: ",project);
    query.push(project);
   // query.push(lookup1);
   // query.push(lookup2);
    query.push(lookup3);
   // query.push(lookup4);
    let criteria = [];
    if(workflowPreset!=""){ criteria.push({ 'presetName':{ $regex:  new RegExp(".*"+workflowPreset+".*") }}); }
    if(currentStatus.length>0){ criteria.push({ 'job_active_stage.status':{$in:  currentStatus }}); }
    if(true){ criteria.push({ 'job_active_stage.status':{"$ne":"Cancelled" }}); }
    if(jobType!=""  && jobType=="Unallocated"){
      criteria.push({'jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c':{ $exists : false}});
    }else if(jobType!=""){ criteria.push({'jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c':{ $eq:jobType}}); }
    if(modules!=""){ criteria.push({'jobMetaproperties.7388493928bc4a9aa57ca65306ed1579':{$eq:modules}}); }
    if(grade!=""){ criteria.push({'jobMetaproperties.c0ac0a86e65f4f7ebd88dbd7e77965ef':{$eq:grade}}); }

    //for automation update
    //  if(true){
       // criteria.push({'isUpdated':false }); 
    //    criteria.push({'job_active_stage.position':{$gt: 1 }});
    //  }
    //change Date range related filters
  if(startDate!="" && startDate.indexOf(" - ") != -1){
    console.log("data::>>", startDate.split(" - "));
    dt= startDate.split(" - ");
    frmDate=dt[0], toDate=dt[1];
    criteria.push({'dateCreated':{$gte: new Date(frmDate) }});
    criteria.push({'dateCreated':{$lte: new Date(toDate) }});
  }else if (endDate!="" && endDate.indexOf(" - ") != -1){
    dt= endDate.split(" - ");
    frmDate=dt[0], toDate=dt[1];
    criteria.push({'job_date_finished':{$gte: new Date(frmDate) }});
    criteria.push({'job_date_finished':{$lte: new Date(toDate) }});
  }
  //  if(startDate!=""){  criteria.push({'dateCreated':{$gte: new Date(startDate) }}); }
  //  if(endDate!=""){  criteria.push({'job_date_finished':{$lte: new Date(endDate) }}); }
   
    var TatQuery={};
      if(isOverdue){
        if(workflowPreset=="Permission"){
          if(jobTypeID=="")
          TatQuery={ asset_typeId: jobTypeID};
        }else{
          TatQuery={ asset_type: workflowPreset };
        }
      }
    console.log("TatQuery::====>", TatQuery);
    Mdb.overdue_jobs.find(TatQuery).then((resTat)=>{
      //console.log(resTat);
      var TatDays=0;
      if(resTat.length ==1 && isOverdue){
          TatDays=resTat[0].tat;
          var match={ CalDuration: { $gte: TatDays}};
          criteria.push({ CalDuration: { $gte: TatDays } });
      }
      if(criteria.length > 0){
          criteria = criteria.length > 0 ? { $and: criteria } : {};
          query.push(  { $match: criteria });
      }
      var countQuery=[];
      for(let kkk=0;  kkk< query.length; kkk++){
        countQuery.push(query[kkk]);
      }
      countQuery.push({ $group: { _id : "null", myCount: { $sum: 1 } } });
      var limit={ $limit : currentPage * rowsPage };
      query.push( limit);
      if(currentPage -1 >0){
        var skip= { $skip: (currentPage -1)* rowsPage};
        query.push(skip);
      }else{
        query.push({$skip: 0});
      }
      console.log("data query is :", JSON.stringify(query));
     // console.log("countQuery is",JSON.stringify(countQuery) );
      Mdb.bynder_jobs.aggregate(countQuery).then((rsCount)=>{
        var coundData=0;
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
      console.log("Error counting is ", Err );
    });
    
  }).catch((Err)=>{
    console.log("TatQuery query ERROR result is:", Err );
  });
  }).catch((Err)=>{
    console.log("Record not fetched in delete_temp_data", Err );
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
    {$project: {"job_stages":1, "Preset_Stages":1, "presetstages":1, "autoStage":1}}];

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
      $nin: ['f2e038c4-9191-4480-a55e-2dc92d3f52e7','3b6d57c7-55c1-489b-aeff-b81b7aaff1ef', '0ad18ec8-8648-4d15-8681-2c3f4e0ee914','bb6f3943-5a47-49f0-ab82-c6278d1dad29']
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

postRoutes.route('/mergeautomationdata').get(function (req, res) {
    var query=[
      //{$match :{campaignID:'12087c22-260a-4fb8-834e-d231c4c277a3'}},
      //{$match :{campaignID:'ee19e14d-bdb9-407b-ab56-17292d585787'}}, //Marketing
      //{$match :{campaignID:'9618db88-fc78-47a5-9916-e864e696ae11'}},  //Eureka Math 2
      {$match :{campaignID:'212087c22-260a-4fb8-834e-d231c4c277a3'}},  //gods 
      //{"$lookup":{"localField":"presetID","from":"job_presets","foreignField":"ID","as":"joincollection"}},
     // { $match :  { "joincollection.name": /.*Permission*./}, },
      {"$match":{"$and":[
       // {"joincollection.name":/.*Permission*./},
       // {"joincollection.name":/.*Created Image*./},
        //{"joincollection.name":/.*Shutterstock*./},
        //{"joincollection.name":/.*Clip Art*./},
        //
        // {"job_active_stage.status":{"$ne":"Cancelled"}},
        //{"jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c":{"$eq":"05dedb5444184ea789c618ef1d188bd5"}}, //Public 
        //{"jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c":{"$eq":"65e0e914a3e34cadb06937b87b8468ca"}}, //creative comments
        //{"jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c":{"$eq":"ebd040f19eeb4b83b6511bb44588d2ef"}}, //Text Quote
        //{"jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c":{"$eq":"1689aacf9c6342dd8735b8f6000e734d"}}, //Stock Image
        //{"jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c":{"$eq":"fc256dbb0f1949709c59b177ff5ad3f6"}},//Licensed Text
        //{"jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c":{"$eq":"03600acb4c724a68ab50aecd29a32266"}}, //Licensed Image
        //{"jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c":{"$eq":"9a0e89f04cd34ceab98cb33d1523c598"}}, //Fine Art
        //{"jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c":{"$eq":"45a2d52b3b5f4743b3b8d201ef966ce9"}},// Link
        //{"jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c":{"$eq":"bfe9c569c4844a06815f8973d586e3f8"}}, // Fair Use
        //{"jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c":{"$exists":false}},
        //{autoStageData :{"$exists":false}},
        //{'job_active_stage.position':{ $gt: 1 }},
        {"isUpdated": { "$eq":true }},
    ]}},
    {$project: { _id:1, job_key:1, jobID:1, job_stages:1, Preset_Stages:1, autoStage:1 ,presetstages:1 }}
  ];
    console.log( JSON.stringify(query) );
   // process.exit("testing");
      var rsCound=1;
      Mdb.bynder_jobs.aggregate(query).then((data)=>{
        if(data.length> 0){
          for(let temp =0; temp< data.length; temp++){
            let autoStageData=data[temp].autoStage;
            let job_stages=data[temp].job_stages;
            let presetstages=data[temp].presetstages;
            if(autoStageData.length >0){
                for(let temp1 =0; temp1< autoStageData.length; temp1++){
                  
                var filterd= presetstages.filter(dd=> dd.name == autoStageData[temp1].StageName );
                //var filterd= job_stages.filter( dd=> dd.position==autoStageData[temp1].position);
                if(filterd.length >0){
                  //autoStageData[temp1].id=autoStageData[temp1].;
                  autoStageData[temp1].position = filterd[0].position;
                  //console.log(filterd);
                }else{
                  console.log("Need for update records:", data[temp1].jobID , data[temp1].job_key );
                  rsCound++;
                  Mdb.bynder_jobs.updateOne({ jobID : data[temp1].jobID },{
                    $set:{
                          presetName: '',
                          presetstages  : new Array(),
                          isUpdated :  false
                    }
                  }).then((rs)=>{
                    console.log("data updated",rs, data[temp1].jobID);

                  }).catch((Err)=>{
                    console.log("Error in updating data", Err, data[temp1].jobID);
                  });
                  //console.log( "autoStage:",JSON.stringify(autoStageData[temp1]) );
                  //console.log("data preset :\n");
                  //console.log("data preset :" , JSON.stringify(presetstages));
                 // process.exit();
                }
              }
              
              // Mdb.bynder_jobs.updateOne({ "_id": data[temp]._id },{ $set :{
              //         "Preset_Stages" : autoStageData,
              //         "isMerged": true
              //       }}).then((dd)=>{ console.log(dd); }).catch((Err)=>{ console.log("update Error", Err);});
            }else{
             // console.log("data not found :", data);
            }
        }
        // let autoStageData=data[temp].autoStage;
        // let job_stages=data[temp].job_stages;
        // let Preset_Stages=data[temp].Preset_Stages;
        // console.log(autoStageData);
        // if( typeof(autoStageData) != "undefined" && data[temp].Preset_Stages &&  autoStageData.length > 0){
        // for(let temp2=0; temp2< autoStageData.length; temp2++){
        //   for(let temp3=0; temp3< job_stages.length; temp3++){
        //     if(job_stages[temp3].id.split("-").join("") == autoStageData[temp2].stageID){
        //       autoStageData[temp2].id = autoStageData[temp2].stageID;
        //       autoStageData[temp2].position = job_stages[temp3].position;
        //     }
        //   }
        // }
        // Mdb.bynder_jobs.updateOne({
        //     "_id": data[temp]._id
        //    },{ $set :{
        //       "Preset_Stages" : autoStageData,
        //       "isMerged": true
        //     }}).then((dd)=> console.log(dd)).catch((Err)=> console.log("update Error", Err));
        // }
        
        //break;
        
      }
      res.json(data);
  }).catch((Err)=>{
    console.log("Error data selection", Err);
  });
});
postRoutes.route('/stageinof').get(function (req, res) {
  Mdb.bynder_jobs.find({isUpdated: true},{ jobID:1, Preset_Stages:1, presetstages:1 }).then((data)=>{
    if(data.length > 0){
       for(let d=0; d < data.length; d++){
         let jobID= data[d].jobID, Preset_Stages= data[d].Preset_Stages, presetstages= data[d].presetstages;
          for(let k=0; k < Preset_Stages.length ; k++){
             var filterd= presetstages.filter((dd)=> dd.position == Preset_Stages[k].position);
             //console.log("ffff=>",filterd);
             if(filterd.length >0){
              Preset_Stages[k].id=filterd[0].ID;
             }
          }
          //console.log("Modified data:", JSON.stringify(Preset_Stages) );
         // process.exit();
          Mdb.bynder_jobs.updateOne({ jobID: jobID},{ $set: {
            Preset_Stages: Preset_Stages
          }}).then((rs)=>{
            console.log("data updated", jobID, rs);
          }).catch((Err)=>{
            console.log("Err", jobID, Err);
          });
       }
    }
  }).catch((Err)=>{
    console.log("Error In Data", Err);
  });
});
postRoutes.route('/mergeautomation').get(function (req, res) {
  var query=[
    //{$match :{campaignID:'12087c22-260a-4fb8-834e-d231c4c277a3'}},
  //{$match :{campaignID:'ee19e14d-bdb9-407b-ab56-17292d585787'}}, //Marketing
    
    //{$match :{campaignID:'12087c22-260a-4fb8-834e-d231c4c277a3'}},  //gods 
    //{$match :{campaignID:'3d39f53b-3123-4eb1-a3f1-274cd4160efe'}}, //Wit & Wisdom
    //{$match :{campaignID:'9618db88-fc78-47a5-9916-e864e696ae11'}},  //Eureka Math 2
    {$match :{campaignID:'4924dc05-03c5-4086-90ce-41d8bf501684'}},  //PhD sci
    //{"$lookup":{"localField":"presetID","from":"job_presets","foreignField":"ID","as":"joincollection"}},
   // { $match :  { "joincollection.name": /.*Permission*./}, },
    {"$match":{"$and":[
     // {"joincollection.name":/.*Permission*./},
     // {"joincollection.name":/.*Created Image*./},
      //{"joincollection.name":/.*Shutterstock*./},
      //{"joincollection.name":/.*Clip Art*./},
      //
      // {"job_active_stage.status":{"$ne":"Cancelled"}},
      //{"jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c":{"$eq":"05dedb5444184ea789c618ef1d188bd5"}}, //Public 
      //{"jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c":{"$eq":"65e0e914a3e34cadb06937b87b8468ca"}}, //creative comments
      //{"jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c":{"$eq":"ebd040f19eeb4b83b6511bb44588d2ef"}}, //Text Quote
      //{"jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c":{"$eq":"1689aacf9c6342dd8735b8f6000e734d"}}, //Stock Image
      //{"jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c":{"$eq":"fc256dbb0f1949709c59b177ff5ad3f6"}},//Licensed Text
      //{"jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c":{"$eq":"03600acb4c724a68ab50aecd29a32266"}}, //Licensed Image
      //{"jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c":{"$eq":"9a0e89f04cd34ceab98cb33d1523c598"}}, //Fine Art
      //{"jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c":{"$eq":"45a2d52b3b5f4743b3b8d201ef966ce9"}},// Link
      //{"jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c":{"$eq":"bfe9c569c4844a06815f8973d586e3f8"}}, // Fair Use
      //{"jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c":{"$exists":false}},
      //{autoStageData :{"$exists":false}},
      //{'job_active_stage.position':{ $gt: 1 }},
      {"isUpdated": { "$eq":true }},
  ]}},
  {$project: { _id:1, job_key:1, jobID:1, job_stages:1, Preset_Stages:1, autoStage:1 ,presetstages:1 }}
];
  console.log( JSON.stringify(query) );
 // process.exit("testing");
    var rsCound=1;
    Mdb.bynder_jobs.aggregate(query).then((data)=>{
      if(data.length> 0){
        for(let temp =0; temp< data.length; temp++){
          let autoStageData=data[temp].autoStage;
          let job_stages=data[temp].job_stages;
          let presetstages=data[temp].presetstages;
          if(autoStageData.length >0){
              for(let temp1 =0; temp1< autoStageData.length; temp1++){
              ///var filterd= presetstages.filter(dd=> dd.id == autoStageData[temp1].id );
              // var filterd= job_stages.filter( dd=> dd.name==autoStageData[temp1].StageName);
              // if(filterd.length >0){
              //   //autoStageData[temp1].id=autoStageData[temp1].;
              //   autoStageData[temp1].position = filterd[0].position;
              //   //console.log(filterd);
              // }
              if(autoStageData[temp1].position ==0){
                console.log( "data position error : ",data[temp].jobID, autoStageData[temp1]);
              }
            }
           // console.log("Need for update records:", rsCound  );
            Mdb.bynder_jobs.updateOne({ "_id": data[temp]._id },{ $set :{
                    "Preset_Stages" : autoStageData,
                    "isMerged": true
                  }}).then((dd)=>{ console.log(dd); }).catch((Err)=>{ console.log("update Error", Err);});
          }else{
            //console.log("data not found :", data);
          }
      }
    }
    res.json(data);
}).catch((Err)=>{
  console.log("Error data selection", Err);
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

postRoutes.route('/exportAsExcel').post(function (req, res) {
  let compaignId ="", workflowPreset="", currentStatus=[] , jobType="", startDate="", endDate="",modules='',
  grade='', isOverdue=false;
  if(req.body.compaignId){
    compaignId=req.body.compaignId;
  }
  if(req.body.workflowPreset){
    workflowPreset=req.body.workflowPreset;
  }
  if(req.body.currentStatus ){
    currentStatus=req.body.currentStatus;
    var neWcurrentStatus=[]; 
    if(currentStatus.length > 0 ){
      for(let temp in currentStatus){
        if( currentStatus[temp] != 'Overdue'){
          neWcurrentStatus.push( currentStatus[temp] );
        }
        if( currentStatus[temp] == 'Overdue'){
          isOverdue=true; 
        }
        if( currentStatus.indexOf('Overdue')>-1 &&   currentStatus.indexOf('Approved') == -1 ){
          neWcurrentStatus.push("Active");
          neWcurrentStatus.push("NeedsChanges");
        }
      }
    }
    currentStatus=neWcurrentStatus;
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
  
      Mdb.delete_temp_data.find({},{jobID:1}).then((TempDeletedata)=>{
        var deletedJobIds=[];
        for(var dd =0; dd < TempDeletedata.length; dd++){
          deletedJobIds.push( TempDeletedata[dd].jobID );
        }
        var  query=[];
        if(compaignId!=""){
          query.push({$match: { campaignID: { $eq: compaignId } } }) ;
        }
        if(deletedJobIds.length > 0){
          query.push({$match: { id: { $nin: deletedJobIds } } }) ;
        }
        ///matchg
        var project={"$project":{"presetName":1, "presetstages":1,"job_key":1,"Preset_Stages":1,"job_stages":1,"joincollection":1, "id":1,"name":1, "job_duration":1,"job_date_finished":1,"dateCreated":1, "job_active_stage":1,"presetID":1,"createdByID":1,"campaignID":1,"jobID":1,
          "jobMetaproperties":1,"Preset_Stages":1,
          "CalDuration":{"$cond":{"if": {"$eq":["$job_date_finished",""]} ,"then":{"$divide":[{"$subtract":[new Date(),"$dateCreated"]},86400000]},
          "else":{
            "$cond":{"if": {"$eq":["$job_date_finished",null]}, "then":  {"$divide":[{"$subtract":[new Date(),"$dateCreated"]},86400000]},
            "else": {"$divide":[{"$subtract":["$job_date_finished","$dateCreated"]},86400000]}
            }
          }}}
    }};
        //var  lookup1={ $lookup:{ localField: "presetID",  from: "job_presets", foreignField : "ID",as: "joincollection"}};
        //var  lookup2={ $lookup:{ localField: "joincollection.presetstages.responsibleID", from: "users", foreignField : "ID", as: "joincollection2"}};
        var  lookup3={ $lookup:{ localField: "campaignID", from:"campaign",foreignField : "ID", as: "joincollection3" }};
        //var  lookup4={"$lookup":{"localField":"jobID","from":"ExportSheetData","foreignField":"job_id","as":"joincollection4"}};
        //query.push(lookup1);
        query.push(project);
        //query.push(lookup2);
        query.push(lookup3);
        //query.push(lookup4);
        let criteria = [];
        if(workflowPreset!=""){
            criteria.push({ 'presetName':{$regex:  new RegExp(".*"+workflowPreset+".*") }});
        }
        if(currentStatus.length>0){
            criteria.push({ 'job_active_stage.status':{$in:  currentStatus }});
        } else if(true){
          criteria.push({ 'job_active_stage.status':{"$ne":"Cancelled" }});
        }
        if(jobType!="" && jobType=="Unallocated" ){
          criteria.push({'jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c':{$exists : false}});
        }
        else if(jobType!=""){
            criteria.push({'jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c':{$eq:jobType}});
        }
        if(modules!=""){
          criteria.push({'jobMetaproperties.7388493928bc4a9aa57ca65306ed1579':{$eq:modules}});
        }
        if(grade!=""){
          criteria.push({'jobMetaproperties.c0ac0a86e65f4f7ebd88dbd7e77965ef':{$eq:grade}});
        }
        if(req.body.startDate ){
          startDate=req.body.startDate.split(" - ");
          criteria.push({'dateCreated':{$gte: new Date(startDate[0]) }});
          criteria.push({'dateCreated':{$lte: new Date(startDate[1]) }});
        }
        if(req.body.endDate ){
          endDate=req.body.endDate.split(" - ");
          criteria.push({'job_date_finished':{$gte: new Date(endDate[0]) }});
          criteria.push({'job_date_finished':{$lte: new Date(endDate[1]) }});
        }
      var TatQuery={};
      if(isOverdue){
        if(workflowPreset=="Permission"){
          TatQuery={ asset_type: jobType};
        }else{
          TatQuery={ asset_type: workflowPreset };
        }

      }
    console.log("TatQuery::====>", TatQuery);
    Mdb.overdue_jobs.find(TatQuery).then((resTat)=>{
      var TatDays=0;
      if(resTat.length ==1 && isOverdue){
          TatDays=resTat[0].tat;
          var match={ CalDuration: {$gte: TatDays}};
          criteria.push({ CalDuration: { $gte: TatDays } });
      }
      if(criteria.length > 0){
            criteria = criteria.length > 0 ? { $and: criteria } : {};
            query.push(  { $match: criteria });
      }
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
  }).catch((Err)=>{
    console.log("Error in tat export==>>", Err);
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
      { "from" : "campaign", "localField" : "campaignID", "foreignField" : "ID","as" : "campaignJoin"}
    
    };
    var project={"$project":{"campaignJoin.name":1, "id":1,"name":1, "job_duration":1,"job_date_finished":1,"dateCreated":1, "job_active_stage":1,"presetID":1,"createdByID":1,"campaignID":1,"jobID":1,
    "jobMetaproperties":1,
    "CalDuration":{$trunc:{"$cond":{"if": {"$eq":["$job_date_finished",""]} ,"then":{"$divide":[{"$subtract":[new Date(),"$dateCreated"]},86400000]},
          "else":{
            "$cond":{"if": {"$eq":["$job_date_finished",null]}, "then":  {"$divide":[{"$subtract":[new Date(),"$dateCreated"]},86400000]},
              "else": {"$divide":[{"$subtract":["$job_date_finished","$dateCreated"]},86400000]}
            }
          }}}}
    }};
      query.push(lookupOvrdue);
      query.push(project);
   var queryfind={"$match":{id: {
        $in: overDueIDs
    }}};
    query.push(queryfind);
    
    console.log("Query for modal ==>", JSON.stringify(query) );
  // Mdb.bynder_jobs.find(query,{campaignID:1,  name:1, job_key:1, job_duration:1, job_date_started:1, job_date_finished:1})
  Mdb.bynder_jobs.aggregate([query]).then((docs)=>{
    res.send(docs);
   }).catch((Err)=>{
    console.log("Error at overdue jobs");
   });
  }
});
postRoutes.route('/clearstage').get(function (req, res) {
  console.log("clearstage action");
  Mdb.bynder_jobs.find({},{Preset_Stages:1, presetDataC:1 }).then((docs)=>{
    console.log("clear empty Preset_Stages", docs.length);
    if(docs.length>0){
      var data=[];
      for( let temp1 in docs ){
        if(docs[temp1].Preset_Stages.length >0){
          var Preset_Stages=docs[temp1].Preset_Stages;
          var New_Preset_Stages=[];
          for(let temp2 in Preset_Stages){
            if( Preset_Stages[temp2].hasOwnProperty('id') ){
              New_Preset_Stages.push(Preset_Stages[temp2]);
            }
          }
          var where ={_id: docs[temp1]._id};
          var set={ $set:{ Preset_Stages: New_Preset_Stages}};
          // var set={ $set:{ presetDataC: New_Preset_Stages}};
         
          Mdb.bynder_jobs.updateOne( where, set ).then((dts)=>{
            console.log("updated data", dts);
           // console.log('Data updated successfully metaproperties.ID:'+ metapropertiesData[k].ID);
          }).catch((Err)=>{
            console.log('Error in updated data:'+ docs[temp1]._id, Err);
          });
          console.log("new data is:==>>", JSON.stringify(New_Preset_Stages) ,"for ::==>>", docs[temp1]._id);
        }
      }
      //console.log("checking..", docs);
    }
    res.send(docs);
   //res.send("checking..");
   }).catch((Err)=>{
    console.log("Error at overdue jobs", Err);
   });
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
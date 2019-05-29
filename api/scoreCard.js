const express = require('express');
const postRoutes = express.Router();
const request = require('request');
const OAuth   = require('oauth-1.0a');
const crypto  = require('crypto');
const await = require("await");
const async = require("async");
let Mdb = require('./post.model');
let appConfig=require('./config');

postRoutes.route('/getoverduejobs').post(function (req, res) {
  console.log("\n\n ACTION getoverduejobs => \n");
  var overDueIDs;
  if(req.body.overDueIDs){ 
    overDueIDs=req.body.overDueIDs; 
    var query = [];
    var lookupOvrdue = { $lookup : 
      { "from" : "campaign", "localField" : "campaignID", "foreignField" : "ID","as" : "campaignJoin"}
    };
    var project={"$project":{"campaignJoin.name":1, "job_key":1, "id":1,"name":1, "job_date_finished":1,"dateCreated":1,
    // "job_active_stage":1,"presetID":1,"createdByID":1,"campaignID":1,"jobID":1,
   // "jobMetaproperties":1,
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
    
    console.log("Query for modal ==>", JSON.stringify(query) ,"\n");
  Mdb.bynder_jobs.aggregate([query]).then((docs)=>{
     console.log("total ovedue jobs :", docs.length);
    res.send(docs);
   }).catch((Err)=>{
    console.log("Error at overdue jobs");
   });
  }
});

postRoutes.route('/scorecarddata').post(function (req, res) {
  // let compaignId = req.params.compaignId;
  console.log("\n\n scorecarddata data comming ..=>", JSON.stringify(req.body), "\n"); 

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
     var frmDate, toDate, dt, isOverdue;
     if(req.body.currentStatus ){
      currentStatus=req.body.currentStatus;
      var neWcurrentStatus=[]; 
      if(currentStatus.length > 0 ){
        for(let temp=0; temp < currentStatus.length; temp++){
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
    console.log("mmmmm=======>",workflowPreset=="" ,compaignId=="", jobType=="" ,grade=="",modules=="", currentStatus.length==0 ,startDateRange=="" , endDateRange=="" );
    if(workflowPreset=="" && compaignId=="" && jobType=="" && grade==""&&modules==""&& currentStatus.length==0 &&startDateRange=="" && endDateRange==""){
        currentStatus.push("Active");
        console.log("Without-filter");
      }
      
      let Searchcriteria=[];
      if(workflowPreset){ Searchcriteria.push( {"presetName": {"$regex":new RegExp(".*"+workflowPreset+".*") }  } ); }
      if(jobType && jobType=="Unallocated"){  Searchcriteria.push({ "jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c": {"$exists":false} });  }
      else if(jobType){  Searchcriteria.push({ "jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c": jobType });  }
      if(grade){ Searchcriteria.push({ "jobMetaproperties.c0ac0a86e65f4f7ebd88dbd7e77965ef": grade }); }
      if(modules){ Searchcriteria.push({ "jobMetaproperties.7388493928bc4a9aa57ca65306ed1579": modules });}
      if(currentStatus && currentStatus.length >0 ){ 
        Searchcriteria.push({ "job_active_stage.status":{'$in': currentStatus }}); 
      }
      //change Date range related filters
      if(startDateRange && startDateRange.indexOf(" - ") != -1){
        dt= startDateRange.split(" - ");
        frmDate=dt[0], toDate=dt[1];
        Searchcriteria.push( {"dateCreated":{"$gte" : new Date(frmDate) }}, { "dateCreated":{"$lte" : new Date(toDate) }} );
      }else if(endDateRange!="" && endDateRange.indexOf(" - ") != -1){
        dt= endDateRange.split(" - ");
        frmDate=dt[0], toDate=dt[1];
        Searchcriteria.push( {"job_date_finished":{"$gte" : new Date(frmDate) }}, { "job_date_finished":{"$lte" : new Date(toDate) }} );
      }
      // if(startDate){
      //   Searchcriteria.push({ "dateCreated": {$gte: new Date(startDate)} });
      // }
      // if(endDate){
      //   Searchcriteria.push({ "job_date_finished": {$lte: new Date(endDate) } });
      // }
      let pipeline=[];
      if(compaignId){  pipeline.push( {"$match":{"campaignID":{"$eq": compaignId }}} );  }
      pipeline.push({"$project":{ "presetName":1,"campaignID":1,"id":1,"jobMetaproperties":1,"name":1,"job_duration":1,"job_date_finished":1,"dateCreated":1,"job_active_stage":1,"presetID":1,"createdByID":1,"campaignID":1,"jobID":1,"Preset_Stages":1,
        "CalDuration":{"$cond":{"if":{"$eq":["$job_date_finished",""]},
        "then":{"$divide":[{"$subtract":[ new Date(),"$dateCreated"]},86400000]},
        "else":{"$cond":{"if":{"$eq":["$job_date_finished",null]},
        "then":{"$divide":[{"$subtract":[ new Date(),"$dateCreated"]},86400000]},
        "else":{"$divide":[{"$subtract":["$job_date_finished","$dateCreated"]},86400000]}}}}}}});
      pipeline.push({"$lookup":{"localField":"campaignID","from":"campaign","foreignField":"ID","as":"joincollection"}});
      // if(workflowPreset){
      //   pipeline.push({"$lookup":{"localField":"presetID","from":"job_presets","foreignField":"ID","as":"joincollection1"}});
      // }
      let forOverDueQuery=Searchcriteria;
        var TatQuery={};
         if(isOverdue){
           if(workflowPreset=="Permission"){
             TatQuery={ asset_type: jobTypeTemp };
           }else{
             TatQuery={ asset_type: workflowPreset };
           }
         }
       console.log("TatQuery::====>", TatQuery);
       Mdb.overdue_jobs.find(TatQuery).then((resTat)=>{
         var TatDays=0;
         if(resTat.length ==1 && isOverdue){
          TatDays=resTat[0].tat;
          Searchcriteria.push({ CalDuration: { $gte: TatDays } });
         }
      if(Searchcriteria.length > 0){
        Searchcriteria =  {$and: Searchcriteria };
        pipeline.push(  { $match: Searchcriteria });
        //pipeline.push(Searchcriteria );
      }
      
      pipeline.push( {"$group" : {_id: {
         "campaignID":"$campaignID" , "compName":"$joincollection.name", 
          "status":"$job_active_stage.status"   },  count:{$sum:1} } } );
         console.log('\x1b[31m',"All count of Query ===>:", JSON.stringify(pipeline));
         
       
       
       Mdb.bynder_jobs.aggregate( pipeline, function (err, result) {
         if (err) { console.log(err); next(err);} else {
           console.log("\n\n All count of Query data length :", result.length);
           let dumpCampIds=[];
           for (var keys; keys< result.length; keys++) {
             if(dumpCampIds.indexOf(result[keys]._id.campaignID) != -1){
               dumpCampIds.push(result[keys]._id.campaignID);
             }
           }
          var dataResult={
            chartData1and2: result
          };
          res.send(dataResult);
         }
       });

      }).catch((Err)=>{
        console.log("Tat Query Error :==>", Err);
       });
 });
 postRoutes.route('/scorecardload').post(async function(req, res, next) {
   console.log("\n\n ACTION scorecardload data comming =>", JSON.stringify(req.body),"\n");
  var workflowPreset="", compaignId ="",jobType="",
  grade="", modules="", startDateRange="", endDateRange="", currentStatus="", jobTypeTemp="", isOverdue=false;
    if(req.body.workflowPreset){ workflowPreset=req.body.workflowPreset; }
    if(req.body.compaignId){ compaignId=req.body.compaignId; }
    if(req.body.jobType){ jobType=req.body.jobType.split("-").join(""); }
    if(req.body.grade){ grade=req.body.grade.split("-").join(""); }
    if(req.body.modules){ modules=req.body.modules.split("-").join(""); }
    if(req.body.startDateRange){ startDateRange=req.body.startDateRange; }
    if(req.body.endDateRange){ endDateRange=req.body.endDateRange; }
    if(req.body.currentStatus ){
      currentStatus=req.body.currentStatus;
      var neWcurrentStatus=[]; 
      if(currentStatus.length > 0 ){
        for(let temp=0; temp < currentStatus.length; temp++){
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
    var frmDate, toDate, dt;
    
    if(workflowPreset==""&& compaignId=="" &&jobType=="" &&grade==""&&modules==""&& currentStatus.length==0 &&startDateRange=="" && startDateRange==""){
      currentStatus.push("Active");
    }
    var resultData=[];
    var count=0;
    let PermissionsData=['Permission','Created Image','Shutterstock','Clip Art'];
    var permissionResponce=[];
    var serchFilter=[];
    var Query=[];
    if(compaignId){ serchFilter.push({ "campaignID": compaignId });  }
    if(jobType && jobType =="Unallocated"){ serchFilter.push({ "jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c": {"$exists":false} }); }
    else if(jobType){ serchFilter.push({ "jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c": jobType }); }
    if(grade){ serchFilter.push({ "jobMetaproperties.c0ac0a86e65f4f7ebd88dbd7e77965ef": grade }); }
    if(modules){ 
      serchFilter.push({ "jobMetaproperties.7388493928bc4a9aa57ca65306ed1579": modules }); 
    }
    if(startDateRange && startDateRange.indexOf(" - ") != -1){
      dt= startDateRange.split(" - ");
      frmDate=dt[0], toDate=dt[1];
      serchFilter.push( {"dateCreated":{"$gte" : new Date(frmDate) }}, { "dateCreated":{"$lte" : new Date(toDate) }} );
     }else if(endDateRange!="" && endDateRange.indexOf(" - ") != -1){
      dt= endDateRange.split(" - ");
      frmDate=dt[0], toDate=dt[1];
      serchFilter.push( {"job_date_finished":{"$gte" : new Date(frmDate) }}, { "job_date_finished":{"$lte" : new Date(toDate) }} );
      }

    if(currentStatus && currentStatus.length >0 ){ 
      serchFilter.push({ "job_active_stage.status":{'$in': currentStatus }}); 
    }
    var allJobsMatch=serchFilter;
    var project={ 
      $project:  { 'id':1, 
        'dateCreated':1,  
        "dateCompleted": "$job_date_finished",
        'CalDuration':1
      }
    };
    //var lookup1=  {"$lookup":{"localField":"presetID","from":"job_presets","foreignField":"ID","as":"joincollection"}};
    var project1={"$project":{"presetName":1, "jobMetaproperties":1,"name":1,"job_duration":1,"job_date_finished":1,"dateCreated":1,"job_active_stage":1,"presetID":1,"createdByID":1,"campaignID":1,"jobID":1,"jobMetaproperties":1,
    "CalDuration":{"$cond":{"if": {"$eq":["$job_date_finished",""]} ,"then":{"$divide":[{"$subtract":[new Date(),"$dateCreated"]},86400000]},
        "else":{
            "$cond":{"if": {"$eq":["$job_date_finished",null]}, "then":  {"$divide":[{"$subtract":[new Date(),"$dateCreated"]},86400000]},
            "else": {"$divide":[{"$subtract":["$job_date_finished","$dateCreated"]},86400000]}}
        }}}    
    }};
    Query.push( project1);

    if(workflowPreset){ 
      serchFilter.push({ "presetName" : {"$regex":new RegExp(".*"+workflowPreset+".*") } }); 
    }
    //console.log("Query data median job duration:: ==>", JSON.stringify(Query) );
    
    if(!workflowPreset){
        for( let temp=0; temp < PermissionsData.length; temp++){
          let serchFilterUnder=[];
          for(let tt=0; tt < serchFilter.length; tt++){
            serchFilterUnder.push(serchFilter[tt] ) ;
          }
          //serchFilter;
          let Query2=[ project1];
          serchFilterUnder.push( { "presetName" : {"$regex": new RegExp(".*"+PermissionsData[temp]+".*") } } ); 
          Query2.push(  { $match: { $and: serchFilterUnder } });
          //Query2.push(project);
          console.log("without Preset data==>", JSON.stringify(Query2) ,"\n\n");
            await  Mdb.bynder_jobs.aggregate(Query2).then((res)=>{
              //console.log("CalDuration data::==>",res[key].CalDuration);
              for(let key=0; key< res.length; key++){  
                res[key].duration= res[key].CalDuration;//dateDiffC(res[key].dateCompleted, res[key].dateCreated);
              }
              permissionResponce.push({ "data" : res, "permission": PermissionsData[temp] } );
            }).catch((Err)=>{
              console.log("Error in permission data", Err);
            }); 
      }
    }else{
      var TatQuery={};
      if(isOverdue){
        if(workflowPreset=="Permission"){
          TatQuery={ asset_type: jobType};
        }else{
          TatQuery={ asset_type: workflowPreset };
        }
      }
    console.log("TatQuery::====>", TatQuery);
    var TatDays=0;
    await Mdb.overdue_jobs.find(TatQuery).then((resTat)=>{
      if(resTat.length ==1 && isOverdue){
          TatDays=resTat[0].tat;
          serchFilter.push({ CalDuration: { $gte: TatDays } });
      }
    }).catch((Err)=>{
      console.log("Error in tat Query==>", Err);
    });

    console.log("data finding testing ================>");
    if(serchFilter.length > 0){
      serchFilter = serchFilter.length > 0 ? { $and: serchFilter } : {};
      Query.push(  { $match: serchFilter });
    }
      /* eslint-disable */ 
      //Query.push(project);
          console.log("Dynamic Search Query==>", JSON.stringify(Query));
          //throw new Error('your die message here');
          await  Mdb.bynder_jobs.aggregate(Query).then((res)=>{
            for(let key=0; key< res.length; key++){
              res[key].duration= res[key].CalDuration;//dateDiffC(res[key].dateCompleted, res[key].dateCreated);
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
 });
postRoutes.route('/medianoverdueperteam').post(async function(req, res, next) {
  console.log("\x1b[34m \n ACTION medianoverdueperteam =>", JSON.stringify(req.body), "\n");
 
  var workflowPreset="", compaignId ="",jobType="",
  grade="", modules="", startDate="", endDate="",startDateRange="", endDateRange="", currentStatus="", jobTypeTemp="", isOverdue=false;
    if(req.body.workflowPreset){ workflowPreset=req.body.workflowPreset; }
    if(req.body.compaignId){ compaignId=req.body.compaignId; }
    if(req.body.jobType){ jobType=req.body.jobType.split("-").join(""); jobTypeTemp=req.body.jobType;}
    if(req.body.grade){ grade=req.body.grade.split("-").join(""); }
    if(req.body.modules){ modules=req.body.modules.split("-").join(""); }
    if(req.body.startDateRange){ startDateRange=req.body.startDateRange; }
    if(req.body.endDateRange){ endDateRange=req.body.endDateRange; }
    if(req.body.currentStatus ){
      currentStatus=req.body.currentStatus;
      var neWcurrentStatus=[]; 
      if(currentStatus.length > 0 ){
        for(let temp =0; temp< currentStatus.length; temp++){
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
    var frmDate, toDate, dt , GTat=0;
    var TatQuery=""; var OverDueData=[];
      var GMatchFilter=[];
      if(compaignId){ GMatchFilter.push({ "campaignID": compaignId });  }
      if(grade){ GMatchFilter.push({ "jobMetaproperties.c0ac0a86e65f4f7ebd88dbd7e77965ef": grade }); }
      if(modules){ GMatchFilter.push({ "jobMetaproperties.7388493928bc4a9aa57ca65306ed1579": modules });}
    //change Date range related filters
      if(startDateRange && startDateRange.indexOf(" - ") != -1){
        dt= startDateRange.split(" - ");
        frmDate=dt[0], toDate=dt[1];
        GMatchFilter.push( {"dateCreated":{"$gte" : new Date(frmDate) }}, { "dateCreated":{"$lte" : new Date(toDate) }} );
      }else if(endDateRange!="" && endDateRange.indexOf(" - ") != -1){
        dt= endDateRange.split(" - ");
        frmDate=dt[0], toDate=dt[1];
        GMatchFilter.push( {"job_date_finished":{"$gte" : new Date(frmDate) }}, { "job_date_finished":{"$lte" : new Date(toDate) }} );
      }
      if(currentStatus && currentStatus.length >0 ){ GMatchFilter.push({ "job_active_stage.status":{'$in': currentStatus }});}
      
      if(workflowPreset!=""){
        var QueryTat;
        var OverDueData=[];
        if(workflowPreset!="Permission"){
          QueryTat={"asset_typeId" : workflowPreset};
        }else{
          if(jobTypeTemp){
            QueryTat={"asset_typeId":jobTypeTemp};
          }else{
            QueryTat={"asset_typeId":'05dedb54-4418-4ea7-89c6-18ef1d188bd5'};
          }
        }
          var tat=0; 
          console.log("\x1b[34m Query for Overdue data kkk:",JSON.stringify(QueryTat) );
          await Mdb.overdue_jobs.find(QueryTat).then((tatData)=>{
            tat= tatData[0].tat
          }).catch((Err)=>{
            console.log("ERror", QueryTat);
          });
          GTat=tat;
          GMatchFilter.push({"CalDuration":{"$gte":tat}});
          GMatchFilter.push({"job_active_stage.status":{"$ne":"Cancelled"}});
          GMatchFilter.push({"job_active_stage.status":{"$in":["Active","NeedsChanges"]}});
          GMatchFilter.push({"presetName":{$regex : new RegExp(".*"+workflowPreset+".*") }});
          if(jobType && jobType=="Unallocated"){ GMatchFilter.push({ "jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c": {"$exists":false} }); }
          else if(jobType){ GMatchFilter.push({ "jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c": jobType }); }
          var overDueQuery=[ //{"$lookup":{"localField":"presetID","from":"job_presets","foreignField":"ID","as":"joincollection1"}},
            {$project: {"campaignID":1,"jobMetaproperties":1,"presetName":1, "job_active_stage":1, "id":1, "job_duration":1, "dateCreated":1, "job_date_finished":1,
                             "CalDuration":{"$cond":{"if":{"$eq":["$job_date_finished",""]},
        "then":{"$divide":[{"$subtract":[ new Date(),"$dateCreated"]},86400000]},
        "else":{"$cond":{"if":{"$eq":["$job_date_finished",null]},
           "then":{"$divide":[{"$subtract":[ new Date(),"$dateCreated"]},86400000]},
        "else":{"$divide":[{"$subtract":["$job_date_finished","$dateCreated"]},86400000]}}}}}}}        
        ];
          if(GMatchFilter.length > 0){
            GMatchFilter = GMatchFilter.length > 0 ? { $and: GMatchFilter } : {};
            overDueQuery.push(  { $match: GMatchFilter });
          }
          var group={ $group: { _id: "", overDueCount: { $sum: 1 }, overDueIds: {$push: "$id"} , "jobDuration":{"$push": "$CalDuration" }}};
          overDueQuery.push(group);
          console.log("\x1b[34m Query for Overdue data Loading",JSON.stringify(overDueQuery) );
          await Mdb.bynder_jobs.aggregate(overDueQuery).then((overDueRes)=>{
           // console.log("overDueRes", workflowPreset ,"===>", overDueRes);
            var overDueCount=0, overDueIds=[], jobDuration=[];
            if(overDueRes.length > 0 && overDueRes[0].hasOwnProperty('overDueCount')){
               overDueCount=overDueRes[0].overDueCount;
               overDueIds=overDueRes[0].overDueIds;
               jobDuration=overDueRes[0].jobDuration;
            }
            
            OverDueData.push({teams: workflowPreset, overDueCount:overDueCount, overDueIds:overDueIds, jobDuration:jobDuration });
           // console.log(overDueRes.length,JSON.stringify(overDueRes));
          }).catch((Err)=>{
            console.log("Err in OverDue data", PermissionsData[k]);
          });
      }else{
        let PermissionsData=['Created Image','Shutterstock','Clip Art'];
        for(let k=0; k< PermissionsData.length; k++){
          var GlobalFiltes=[];
          // for(let tt in GMatchFilter){
          //   GlobalFiltes.push(GMatchFilter[tt] ) ;
          // }
          var overdueQ=[],QueryTat; var tat=0;
          if(PermissionsData[k]=="Permission"){
           // QueryTat={"asset_typeId":'05dedb54-4418-4ea7-89c6-18ef1d188bd5'};
          }else{
            QueryTat={"asset_typeId":PermissionsData[k]};
            await Mdb.overdue_jobs.find(QueryTat).then((tatData)=>{
              tat= tatData[0].tat
            }).catch((Err)=>{
              console.log("ERror=>", JSON.stringify(QueryTat));
            });
          }
          var overDueQuery=[/*{"$lookup":{"localField":"presetID","from":"job_presets","foreignField":"ID","as":"joincollection1"}  },*/
          {$project: {"presetName":1,"jobMetaproperties":1,"presetName":1, "job_active_stage":1, "id":1, "job_duration":1, "dateCreated":1, "job_date_finished":1,
          "CalDuration":{"$cond":{"if": {"$eq":["$job_date_finished",""]} ,"then":{"$divide":[{"$subtract":[new Date(),"$dateCreated"]},86400000]},
            "else":{
              "$cond":{ "if": {"$eq":["$job_date_finished",null]}, "then":  {"$divide":[{"$subtract":[new Date(),"$dateCreated"]},86400000]},
                "else": {"$divide":[{"$subtract":["$job_date_finished","$dateCreated"]},86400000]}
              }
            }}}
          }}
          ];
          var matchFilter=[];
          for(let tt=0; tt< GlobalFiltes.length; tt++){
            matchFilter.push(GlobalFiltes[tt]);
          }
          //matchFilter=GlobalFiltes;
          matchFilter.push({ "job_active_stage.status":{'$in': ['Active'] }});
          matchFilter.push({"CalDuration":{"$gte": tat }});
          matchFilter.push({"presetName":{$regex : new RegExp(".*"+PermissionsData[k]+".*") }});
          if(matchFilter.length > 0){
            matchFilter = matchFilter.length > 0 ? { $and: matchFilter } : {};
            overDueQuery.push(  { $match: matchFilter });
          }
          var group={ $group: { _id: "", overDueCount: { $sum: 1 }, overDueIds: {$push: "$id"} , "jobDuration":{"$push": "$CalDuration" } }};
          overDueQuery.push(group);
          console.log("\x1b[34m \n Query for Overdue data llll:", JSON.stringify(overDueQuery),"\n\n" );
          
          await Mdb.bynder_jobs.aggregate(overDueQuery).then((overDueRes)=>{
           // console.log("overDueRes", PermissionsData[k] ,"===>", overDueRes);
            var overDueCount=0, overDueIds=[], jobDuration=[];
            if(overDueRes.length > 0 && overDueRes[0].hasOwnProperty('overDueCount')){
               overDueCount=overDueRes[0].overDueCount;
               overDueIds=overDueRes[0].overDueIds;
               jobDuration=overDueRes[0].jobDuration;
            }
            
            OverDueData.push({teams: PermissionsData[k], overDueCount:overDueCount, overDueIds:overDueIds, jobDuration:jobDuration});
            console.log( "Over due data length ", overDueRes.length ,"\n");
          }).catch((Err)=>{console.log("Err in OverDue data", PermissionsData[k]);});
        }
        // for permission overdue data
        var IDS=[], QuerysPermission=[];
        await Mdb.metaproperties.find({ID:'262f92ed-59b1-4c3a-a74d-6877d7f8ba4c'},{"options.ID":1}).then((Data)=>{
          console.log("All Tat Catatory data=",Data[0].options);
          for(let k=0; k < Data[0].options.length; k++){
              if(Data[0].options[k].ID && Data[0].options[k].ID!="")
              IDS.push(Data[0].options[k].ID);
          }
        }).catch((Err)=>{
          console.log("Err in get permission voderdue TAT");
        });
        await Mdb.overdue_jobs.find({ asset_typeId: {  $in: IDS } },{asset_typeId:1, asset_type:1, tat:1}).then((docs)=>{
            console.log("\n Overdue data TAT is", JSON.stringify(docs), "\n\n");
            for(let dt=1; dt< docs.length; dt++){
                var overDueQuery=[ //{"$lookup":{"localField":"presetID","from":"job_presets","foreignField":"ID","as":"joincollection1"}},
                {$project: {"jobMetaproperties":1,"presetName":1, "job_active_stage":1, "id":1, "job_duration":1, "dateCreated":1, "job_date_finished":1,
                "CalDuration":{"$cond":{"if": {"$eq":["$job_date_finished",""]} ,"then":{"$divide":[{"$subtract":[new Date(),"$dateCreated"]},86400000]},
                "else":{
                  "$cond":{"if": {"$eq":["$job_date_finished",null]}, "then":  {"$divide":[{"$subtract":[new Date(),"$dateCreated"]},86400000]},
                    "else": {"$divide":[{"$subtract":["$job_date_finished","$dateCreated"]},86400000]}
                  }
                }}}
              }}
              ];
                var matchFilter=[];
                for(let tt=0; tt < GlobalFiltes.length; tt++){
                  matchFilter.push(GlobalFiltes[tt]);
                }
                matchFilter.push({ "job_active_stage.status":{'$in': ['Active'] }});
                matchFilter.push({"CalDuration":{"$gte": docs[dt].tat }});
                matchFilter.push({"presetName":{$regex : new RegExp(".*Permission.*") }});
                matchFilter.push({"jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c": docs[dt].asset_typeId.split("-").join("") });
                if(matchFilter.length > 0){
                  matchFilter = matchFilter.length > 0 ? { $and: matchFilter } : {};
                  overDueQuery.push(  { $match: matchFilter });
                }
                var group={ $group: { _id: "", overDueCount: { $sum: 1 }, overDueIds: {$push: "$id"} , "jobDuration":{"$push": "$CalDuration" } }};
                overDueQuery.push(group);
                QuerysPermission.push(overDueQuery);

            }
          }).catch((Err)=>{ console.log("Err in permission var tat", Err); });

       for (let kk =0; kk< QuerysPermission.length; kk++){
        console.log("\x1b[34m \n Query for Overdue data for PermissionsData : LLL", JSON.stringify(QuerysPermission[kk]) ,"\n\n" );
               
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
      }
      var rsdata={ GTat:GTat, OverDueData:OverDueData};
      res.send(rsdata);
});


 ////////////////
 postRoutes.route('/createdcompletedjobs').post( function(req, res, next) {
  console.log("createdcompletedjobs => ACTION", JSON.stringify(req.body));
  var workflowPreset="", compaignId ="",jobType="",
  grade="", modules="", startDate="", endDate="",startDateRange="", endDateRange="", currentStatus="", jobTypeTemp="", isOverdue=false;
    if(req.body.workflowPreset){ workflowPreset=req.body.workflowPreset; }
    if(req.body.compaignId){ compaignId=req.body.compaignId; }
    if(req.body.jobType){ jobType=req.body.jobType.split("-").join(""); jobTypeTemp=req.body.jobType; }
    if(req.body.grade){ grade=req.body.grade.split("-").join(""); }
    if(req.body.modules){ modules=req.body.modules.split("-").join(""); }
    if(req.body.startDateRange){ startDateRange=req.body.startDateRange; }
    if(req.body.endDateRange){ endDateRange=req.body.endDateRange; }
    if(req.body.currentStatus ){
      currentStatus=req.body.currentStatus;
      var neWcurrentStatus=[]; 
      if(currentStatus.length > 0 ){
        for(let temp=0; temp< currentStatus.length; temp++){
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
    if(workflowPreset=="" && compaignId=="" && jobType=="" && grade==""&&modules==""&& currentStatus.length==0 &&startDateRange=="" && endDateRange==""){
      currentStatus.push("Active");
      console.log("Without-filter");
    }
    let dt, frmDate, toDate;
    var resultData=[];
    var count=0;
    let PermissionsData=['Permission','Created Image','Shutterstock','Clip Art'];
    var Searchcriteria=[];
    var Searchcriteria2=[];
    //change Date range related filters
    if(startDateRange && startDateRange.indexOf(" - ") != -1){
      console.log("startDateRange:==>>", startDateRange);
      dt= startDateRange.split(" - ");
      frmDate=dt[0], toDate=dt[1];
      Searchcriteria.push( {"dateCreated":{"$gte" : new Date(frmDate) }}, { "dateCreated":{"$lte" : new Date(toDate) }} );
      Searchcriteria2.push({"dateCreated":{"$gte" : new Date(frmDate ) }}, { "job_date_finished":{"$lte" : new Date(toDate)}});
    }else if(endDateRange!="" && endDateRange.indexOf(" - ") != -1){
      console.log("endDateRange:==>>", endDateRange);
      dt= endDateRange.split(" - ");
      frmDate=dt[0], toDate=dt[1];
      Searchcriteria.push( {"dateCreated":{"$gte" : new Date(frmDate) }}, { "job_date_finished":{"$lte" : new Date(toDate) }} );
      Searchcriteria2.push({"job_date_finished":{"$gte" : new Date(frmDate ) }}, { "job_date_finished":{"$lte" : new Date(toDate)}});
    }else{
      console.log("startDateRange:==>>", startDateRange);
      frmDate=new Date(); 
      frmDate.setDate(frmDate.getDate()-98);
      toDate=new Date();
      console.log("ELSE :==>>", frmDate, toDate);
      Searchcriteria.push( {"dateCreated":{"$gte" : frmDate }}, { "dateCreated":{"$lte" : new Date() }} );
      Searchcriteria2.push({"dateCreated":{"$gte" : frmDate }}, { "job_date_finished":{"$lte" : new Date()}});
    }
    
   // var lookup2= {"$lookup":{"localField":"presetID","from":"job_presets","foreignField":"ID","as":"joincollection"}};

    var Project1= {$project:{  dateC: { $dateToString: { format: "%Y-%m-%d", date: "$dateCreated" } }}};
    var Project2={$project:{  dateC: { $dateToString: { format: "%Y-%m-%d", date: "$job_date_finished" } }}};
    var Group={"$group" : {_id:"$dateCreated", count:{$sum:1}}};
    var CreatedQuery=[];
    var FinishedQuery=[];
    var topProjection={"$project":{"presetName":1, "id":1,"jobMetaproperties":1,"name":1, "job_duration":1,"job_date_finished":1,"dateCreated":1, "job_active_stage":1,"presetID":1,"createdByID":1,"campaignID":1,"jobID":1,
    "jobMetaproperties":1, "Preset_Stages":1,
    "CalDuration":{"$cond":{"if": {"$eq":["$job_date_finished",""]} ,"then":{"$divide":[{"$subtract":[new Date(),"$dateCreated"]},86400000]},
          "else":{
            "$cond":{"if": {"$eq":["$job_date_finished",null]}, "then":  {"$divide":[{"$subtract":[new Date(),"$dateCreated"]},86400000]},
              "else": {"$divide":[{"$subtract":["$job_date_finished","$dateCreated"]}, 86400000]}
            }
          }}}
    }};
    if(workflowPreset){ 
     // CreatedQuery=[lookup2];
     // FinishedQuery=[lookup2];
      CreatedQuery.push(topProjection);
      FinishedQuery.push(topProjection);
      console.log("workflowPreset data is :", workflowPreset);
      Searchcriteria.push({ "presetName":{"$regex":new RegExp(".*"+workflowPreset+".*") } }); 
      Searchcriteria2.push({ "presetName":{"$regex":new RegExp(".*"+workflowPreset+".*") } }); 
    }
    if(compaignId){ 
      Searchcriteria.push({ "campaignID": compaignId }); 
      Searchcriteria2.push({ "campaignID": compaignId }); 
    }
    if(jobType && jobType == "Unallocated"){ 
      Searchcriteria.push({ "jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c": {"$exists":false} }); 
      Searchcriteria2.push({ "jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c": {"$exists":false} }); 
    } else if(jobType){ 
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
      //Searchcriteria2.push({ "job_active_stage.status":{'$in': currentStatus }});
    }else{
      Searchcriteria.push({"job_active_stage.status":{"$ne":"Cancelled"}});
      Searchcriteria2.push({"job_active_stage.status":{"$ne":"Cancelled"}});
    }
    var TatQuery={};
      if(isOverdue){
        if(workflowPreset=="Permission"){
          TatQuery={ asset_type: jobTypeTemp};
        }else{
          TatQuery={ asset_type: workflowPreset };
        }
      }
    console.log("TatQuery::====>", TatQuery);
    Mdb.overdue_jobs.find(TatQuery).then((resTat)=>{
      var TatDays=0;
      if(resTat.length ==1 && isOverdue){
          TatDays=resTat[0].tat;
          Searchcriteria.push({ CalDuration: { $gte: TatDays } });
          Searchcriteria2.push({ CalDuration: { $gte: TatDays } });
      }
   
    if(Searchcriteria.length > 0){
      Searchcriteria = Searchcriteria.length > 0 ? { $and: Searchcriteria } : {};
      CreatedQuery.push(  { $match: Searchcriteria });
    }

    if(Searchcriteria2.length > 0){
      Searchcriteria2 = Searchcriteria2.length > 0 ? { $and: Searchcriteria2 } : {};
      FinishedQuery.push(  { $match: Searchcriteria2 });
    }
    //CreatedQuery.push(  Project1 );
   // FinishedQuery.push( Project2 );
    CreatedQuery.push(Group);
    FinishedQuery.push( Group );
    console.log("\nCreated:", JSON.stringify(CreatedQuery), "\nFinishedQuery:", JSON.stringify(FinishedQuery));
    Mdb.bynder_jobs.aggregate(CreatedQuery).then((result1)=>{
        Mdb.bynder_jobs.aggregate(FinishedQuery).then((result2)=>{
          resultData={CreatedData:result1, FinishedData:  result2, StartTime: frmDate, EndTime: toDate };
          //console.log("\n\nWeekly graph data length is:", resultData.length );
          res.send(resultData);
        }).catch((Err)=>{
          console.log("Errordata in createdDAte",Err);
        });
    }).catch((Err)=>{
      console.log("Errordata in createdDAte",Err);
    });
  }).catch((Err)=>{
    console.log("Err in Tat==>", Err);
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
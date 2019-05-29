const express = require('express');
const postRoutes = express.Router();
const request = require('request');
const OAuth   = require('oauth-1.0a');
const crypto  = require('crypto');
const fetch = require('node-fetch');
let mysql  = require('mysql');
var slashes = require('slashes');
let config = require('./Mysqlconfig.js');
let connection = mysql.createConnection(config);
let Mdb = require('./post.model');
let appConfig=require('./config');

Array.prototype.insert = function ( index, item ) { this.splice( index, 0, item ); };
String.prototype.decode=function(){
  var a= this.split("")
  a.insert(8,"-");
  a.insert(13,"-");
  a.insert(18,"-");
  a.insert(23,"-");
  return a.join("");
};

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
postRoutes.route('/synccampaignId').get(function (req, res) {
  var hostname="http://localhost:4000";
  Mdb.campaign.find({ ID:{$in:[
    //'0ad18ec8-8648-4d15-8681-2c3f4e0ee914',  //  workflow testing
    //'f2e038c4-9191-4480-a55e-2dc92d3f52e7',    //  Great Minds
   /// 'ee19e14d-bdb9-407b-ab56-17292d585787',    //  Marketing
   // '12087c22-260a-4fb8-834e-d231c4c277a3' ,   //  Geodes Readable Library
   // '3d39f53b-3123-4eb1-a3f1-274cd4160efe',    //  Wit & Wisdom 
   // '9618db88-fc78-47a5-9916-e864e696ae11',    //  Eureka Math 2
   '4924dc05-03c5-4086-90ce-41d8bf501684'    //  PhD Science 1500
  ]}}).then((docs)=>{
      for(var i = 0;i < docs.length; i++){
        let k = i;
            excuteURL( hostname+"/data/jobsbycampaignid/"+ docs[k].ID );
      }
      var getMetaPropertys= hostname+"/data/metaproperties";
      excuteURL( getMetaPropertys );
     res.send("HI data is comming");
    }).catch((Err)=>{
      console.log("synccampaignId Error id", Err );
    });
});
function  excuteURL(URLexc){
  console.log("\n\n excuteURL",URLexc );
  try{
    var options = { method: 'GET', url: URLexc, headers:{ 'Cache-Control': 'no-cache' }};
    request(options,  function (error, response, body) {
      if (error) //throw new Error(error);
      console.log(error);
    });
  }catch(Err){
    console.log("Error:", Err);
  }
}

postRoutes.route('/jobsbycampaignid/:campaignId').get(function (req, res) {
  let campaignId = req.params.campaignId;
  var request_data=appConfig.getActionInfo("jobsbycampaignid", campaignId);
  var token=appConfig.getToken();
	request({url: request_data.url, method: request_data.method, form: request_data.data, headers: oauth.toHeader(oauth.authorize(request_data, token))
	}, function(error, response, body) {
    //console.log("API responded ...", JSON.stringify(request_data));
    var compID=campaignId;
    var JobsResult = JSON.parse(response.body);
    try{
      if(JobsResult.length >0 ){
        var campaignID=  JobsResult[0].campaignID , dataCount= JobsResult.length ;
      console.log("API RESPONDED ==>", JobsResult.length );
      //console.log(JobsResult[0])
      let sql = `INSERT INTO cron_tab set data= '`+ slashes.add( JSON.stringify(JobsResult) ) +`', 
      apiURL = '`+ campaignID +`',  jobs = '`+ dataCount +`' `;
      //console.log(sql);
      connection.query(sql);
      }
     }catch(e){
      console.log("Error is :==>", e);
    }
    res.send("done");
	});
});
postRoutes.route('/debug').get(function (req, res) {
    let sql = `SELECT * FROM cron_tab where id ='288' `;//in ( SELECT max(id) FROM cron_tab )`;
    connection.query(sql, (error, results) => {
      if(error){ console.log("Error : ", error);}
      if(results.length >0 ){
        var JobsResult=JSON.parse(results[0].data);
          for(let k=0; k < JobsResult.length; k++){
            if(JobsResult[k].job_key == "08598f2b-e3da-4de4-8805-2e2b9d3a7471"){
              console.log(JobsResult[k]);
              
            }
          }
          res.send(JobsResult);
      }
    });
});
postRoutes.route('/syncdatajobs').get(function (req, res) {
  try{
      let sql = `SELECT * FROM cron_tab where id in ( SELECT min(id) FROM cron_tab WHERE isComplate=false)`;
      connection.query(sql, (error, results) => {
    	  if (error) {  console.log(error.message); }
	      if(results.length >0 ){
	    	  var mysqlID=results[0].id;
	    	  console.log("Data excuted : ID",mysqlID, "CampaignID:",results[0].apiURL, "JOBS",results[0].jobs);
	    	  var JobsResult=JSON.parse(results[0].data);
	    	  var movedCount=0, updatedID=new Array(); savedID=new Array();
	    	  for(let k=0; k< JobsResult.length; k++){
	    		  var avoidJobsID=new Array("adf84a7b-64a3-4315-9713-fdb3f61f691f","156d2215-69bf-4800-aebd-91b80f342e57", "dcf9d435-5400-49e1-a204-4010f237a72c", "88de0eef-5a29-4c5b-adb1-1306f5bab783", "ce7c38df-51da-4045-92c8-1fc035fae8b8","08be44fa-5ca2-4def-b213-ff9f5ddf88fe","15379fb4-ded4-4a7b-8d5a-9eb1bc4b173b","2b293143-6b50-4075-aed9-2bc7c8144c9f","e7cc232e-6869-46fa-99bf-250c9334e019","89af2131-2527-4418-80c6-ad3cead118f9","74979e90-20af-40ef-b0d5-5cca1c936aad","b316c54a-8419-4df6-8de2-e0ffa4e6f120","91f3db11-1e0e-41ea-a974-c1d3bd562baa","42da2b82-9a1e-48b5-af73-5a16b035638e","ee305287-f0b1-48ff-ac14-7435dbf2cf4c", "a76e8939-becb-4e93-9724-47d8825d96bf","c7b51762-acf8-48ce-9e8f-9d09a2291f93","fe842b52-05cb-4201-bee4-3169fe02b7b4", "22d2e518-3597-4e07-94ed-18732c221690","2b8a742d-daca-4c4e-bb60-4c8f2620671f","55234d0a-c0aa-48e6-8374-b41429817138","5af4c49d-1ff0-46cc-904d-0f5f7600900e","97f1ebf4-d35f-46ab-a7c7-b719b39792b1","c284d58c-efea-4a1b-8d29-a674110681f5","e38c76bc-4f4a-421f-9c55-ece7092cf71d","20fb382d-961c-4765-9bfb-46b7d3a9c23e","30087be0-c060-45d7-9231-df75bb73b792","518feaf1-895c-4fcc-895e-d4fe22d3c9fb","37768508-e952-494e-ba15-dcb00b9f658f","5c33feb5-e4cf-4ba0-adb8-5771ab7156f1","498e05b0-6755-4d7d-b20e-0e8493090ad7","6ac76c04-41ff-4522-897f-f6bd379a35fa", "f5a1d57c-9c0a-4ab6-9b29-abd54acc9767","5237a18e-b994-4078-8da6-dbd04f45c053","6f075f28-b600-4246-8679-bc99f3b52d95","6ceee960-7cf5-4404-b03e-cda11e764313","87e7b625-aa80-45c4-bdb8-3d5ca89c632d","c85e4b0d-5855-4935-8710-f168dbfa6642", "c3825c47-fc8e-40f3-9921-d236bdfa9019","d0fb96c7-3081-4589-87a4-31a18b05a4dd","79d661a9-d32a-4885-a2e1-568fc435d890", "898c68ac-4d5d-47ee-abf5-fb0e65b0ad00", "e01974b9-5ef6-410c-9a5d-8727923dc773","d238a3a0-a46d-4955-9ca3-40dbe3a7d282","f6e3d02e-d8c6-4109-9089-599202688684", "0597919f-842d-4d50-b21c-0b7b8ffcc6ab","6ad45656-1ad0-4e6d-a8c3-617aff42cc9c","e356dcbb-1616-4943-955b-fc01fd836959","b4f59eb0-d916-4414-a707-fcc2382d2c12","96f3ca27-13fe-468b-b53b-cfb45a49dcae","b6f6e004-28dd-4967-b80e-5dcc879292be","4f38e28b-2ed8-4ca9-a71e-10544c42415d","4a33845f-78a8-44ab-9359-fea885cc5295", "8fcc8e3f-2f69-45d7-964d-06e2300b12cb","209b469e-5e87-4c02-8ee0-4f317fe20dac");
	    		  var cond=true; for(let ttemp=0; ttemp<avoidJobsID.length; ttemp++){ if(avoidJobsID[ttemp] == JobsResult[k].id){ cond=false ; break; } }
	    		  if(cond &&  new Date (JobsResult[k].dateCreated) > new Date("2019-02-25")){
              var Query=[{"$lookup":{"localField":"presetID","from":"job_presets","foreignField":"ID","as":"joincollection"}}];
              Query.push({$match: { id: JobsResult[k].id }});
              //console.log("Job in process:", { id: JobsResult[k].id });
              //console.log(JSON.stringify(Query));
              Mdb.bynder_jobs.aggregate( Query ).then((docs)=>{
                if(docs.length >0){
                  if(!docs[0].hasOwnProperty("presetstages")){
                    updatePresetData(docs[0]);
                  }
                  //-------  ---- - --------
                  // if(JobsResult[k].id=="08598f2b-e3da-4de4-8805-2e2b9d3a7471"){
                  //   console.log(JobsResult[k]);
                  //   //process.exit();
                  // }
                  var PresetData=[];
                  if(docs[0].hasOwnProperty("presetstages") ){
                    PresetData=docs[0].presetstages;
                  }else if(docs[0].joincollection.length >0){
                    PresetData=docs[0].joincollection[0].presetstages;
                  }
                  var NewPreset_Stages=new Array();
                  if(JobsResult[k].hasOwnProperty('job_active_stage') && docs[0].job_active_stage){
                    var currentStage=JobsResult[k].job_active_stage;
                    var oldStage=docs[0].job_active_stage;
                    //console.log( "Stage Positon moment :", currentStage.position != oldStage.position);
                    if(currentStage.position != oldStage.position ){
                      var OldPreset_Stages=docs[0].Preset_Stages;
                        for(let num=0; num< OldPreset_Stages.length; num++){
                          if(num==(OldPreset_Stages.length-1)){
                            //console.log("PresetData data value", PresetData);
                              var StageNames= PresetData.filter(data=>data.position==OldPreset_Stages[num].position);
                              OldPreset_Stages[num].StageNames=(StageNames.length >0)?StageNames[0].name:"";
                              OldPreset_Stages[num].job_date_finished=new Date();
                              OldPreset_Stages[num].accuracy=true;
                          }
                          NewPreset_Stages.push(OldPreset_Stages[num]);
                      }
                    }//else if(currentStage.status !=oldStage.status){
                    //console.log("old Stage", JSON.stringify(NewPreset_Stages), 'New Stage:', JSON.stringify(JobsResult[k]));
                    // }
                    // current stage Name
                    var StageNames= PresetData.filter(data=>data.position==JobsResult[k].job_active_stage.position);
                    JobsResult[k].job_active_stage.StageNames=(StageNames.length >0)?StageNames[0].name:"";
                    var Current_job_active_stage =JobsResult[k].job_active_stage ;
                    Current_job_active_stage.start_date = new Date();
                    NewPreset_Stages.push( Current_job_active_stage );
                    // if(NewPreset_Stages.length >0){
                    //   for(var dtemp=0; dtemp < NewPreset_Stages.length; dtemp++){
                    //     console.log("Old Stages name =>",NewPreset_Stages[dtemp].StageNames);
                    //   }
                    // }
                    //console.log("process exit code: ", StageNames,PresetData);
                    //process.exit('testing under update');
                    //console.log( "Stage count :", NewPreset_Stages.length > docs[0].Preset_Stages.length);
                    if(NewPreset_Stages.length > docs[0].Preset_Stages.length){
                        if(NewPreset_Stages[0].hasOwnProperty("StageNames") && NewPreset_Stages[0].StageNames=="Complete Request Form"){
                          var lastIndex=(docs[0].job_stages.length-1);
                          var $set={
                                  jobMetaproperties : JobsResult[k].jobMetaproperties,
                                  job_previous_stage: JobsResult[k].job_previous_stage,
                                  job_active_stage: JobsResult[k].job_active_stage ,
                                  job_next_stage : JobsResult[k].job_next_stage, 
                                  Preset_Stages : NewPreset_Stages ,
                                  dateCreated : NewPreset_Stages[0].job_date_finished
                          };
                        }else{
                          var lastIndex=(docs[0].job_stages.length-1);
                          var $set={
                                  jobMetaproperties : JobsResult[k].jobMetaproperties,
                                  job_previous_stage: JobsResult[k].job_previous_stage,
                                  job_active_stage: JobsResult[k].job_active_stage ,
                                  job_next_stage : JobsResult[k].job_next_stage, 
                                  Preset_Stages : NewPreset_Stages 
                          };
                        }
                     // console.log( "UPDATE DATA :", JSON.stringify($set));
                      Mdb.bynder_jobs.updateOne({ id : JobsResult[k].id }, { $set : $set }).then((res) => { 
                        console.log( JobsResult[k].id,"==>", res); })
                      .catch((Err) => { console.log("unable to updated bynder_jobs ID:", JobsResult[k].id, Err); });
                    }else if(docs[0].job_active_stage.status!= JobsResult[k].job_active_stage.status){
                   // console.log("status changed", docs[0].id);
                    var job_date_finished="";
                    if(( docs[0].job_date_finished=="" || docs[0].job_date_finished==null ) && JobsResult[k].job_active_stage.status=="Approved"){
                        job_date_finished= new Date();
                    }else if(JobsResult[k].job_active_stage.status!=docs[0].job_active_stage.status){
                        job_date_finished= "";
                    }
                    var NewPreset_Stages=docs[0].Preset_Stages;
                    if(NewPreset_Stages.length-1 >-1){
                        NewPreset_Stages[NewPreset_Stages.length-1].job_date_finished=new Date();
                    }
                    if(NewPreset_Stages.length >0){
                        //update all Stage Name if any changes //
                        for(let l=0; l< NewPreset_Stages.length; l++){
                            var StageNames= PresetData.filter(data=>data.position== NewPreset_Stages[l].position);
                            NewPreset_Stages[l].StageNames=StageNames[0].name;
                        }
                    }
                    var set;
                    if(typeof job_date_finished== "string"){
                       set={
                        jobMetaproperties : JobsResult[k].jobMetaproperties,
                        job_previous_stage: JobsResult[k].job_previous_stage,
                        job_active_stage: JobsResult[k].job_active_stage, 
                        job_next_stage : JobsResult[k].job_next_stage, 
                        Preset_Stages: NewPreset_Stages //, job_date_finished : job_date_finished 
                    };
                    }else{
                       set={
                        jobMetaproperties : JobsResult[k].jobMetaproperties,
                        job_previous_stage : JobsResult[k].job_previous_stage,
                        job_active_stage : JobsResult[k].job_active_stage, 
                        job_next_stage : JobsResult[k].job_next_stage, 
                        Preset_Stages : NewPreset_Stages ,
                        job_date_finished : job_date_finished 
                    };
                    }
                    
                    Mdb.bynder_jobs.updateOne({ id : JobsResult[k].id , campaignID: JobsResult[k].campaignID }, 
                      { $set: { 
                        jobMetaproperties : JobsResult[k].jobMetaproperties,
                        job_previous_stage : JobsResult[k].job_previous_stage,
                        job_active_stage : JobsResult[k].job_active_stage, 
                        job_next_stage : JobsResult[k].job_next_stage, 
                        Preset_Stages : NewPreset_Stages 
                      }  } ) .then((dt) => {
                        console.log( "Updated ID", JobsResult[k].id,"==>", dt);
                    }).catch((Err) => {
                        console.log("not updated bynder_jobs ID:", dataJobsResult[k].id, Err);
                    });
                    console.log("process for Update ID under change stage from : ", docs[0].job_active_stage.status, "to==>", 
                    JobsResult[k].job_active_stage.status, " ==> ", 
                    JobsResult[k].id);
                  }
                  
                  }
                  
                }else{
                  //save code for bynder jobs 
                  var job_active_stage= JobsResult[k].job_active_stage;
                  if(job_active_stage.position==1){
                    job_active_stage.start_date=JobsResult[k].dateCreated;
                    job_active_stage.accuracy=true;
                  }else{
                    job_active_stage.start_date=new Date();
                    job_active_stage.accuracy=false;
                  }
                  var MPS_Preset_Stages=[job_active_stage];
                  JobsResult[k].jobID=JobsResult[k].id.split("-").join("");
                  if( typeof JobsResult[k].jobMetaproperties.e9074f5b472f41d4a92ac511e53da775 != "undefined" &&  JobsResult[k].jobMetaproperties.e9074f5b472f41d4a92ac511e53da775!=""){
                      JobsResult[k].dateCreated=new Date( JobsResult[k].dateCreated );
                  }else{
                      JobsResult[k].dateCreated=new Date( JobsResult[k].dateCreated );
                  }
                  //JobsResult[k].job_key=""; job_key should be update with meatupdate request
                  JobsResult[k].job_date_finished="";
                  JobsResult[k].Preset_Stages=MPS_Preset_Stages;
                  JobsResult[k].loadPreset=false;
                  JobsResult[k].loadMeta=false;
                  console.log("process for Saved DATA ID: ", JobsResult[k].id);
                  var bynder_jobs=new Mdb.bynder_jobs(JobsResult[k]);
                  bynder_jobs.save().then((rs) => { console.log('business in added successfully id:'+ JobsResult[k].id,rs ); }).catch((Err) => {
                    console.log("unable to save bynder_job id:", JobsResult[k].id , Err);
                  });
                  //
                  updatePresetData(JobsResult[k]);
                  var sql="update cron_tab set  isComplate =true where id= '"+ mysqlID+"'";
                  connection.query( sql );
                }
              }).catch((Err)=>{
                console.log("Err ddddd :", Err);
              });
	    		  }
          }
          var sql="update cron_tab set  isComplate =true where id= '"+ mysqlID+"'";
		      connection.query(sql);
	      }else{
          console.log("not found new update");
          excuteURL("http://localhost:4000/data/syncPresetData");// we have id also we can sync preset besed on ID
	      }
	  res.send("data merged");
      //console.log("updated record iD ==>",results[0].id);
      var  sqld="select max(id) id from cron_tab where isComplate =true";
      connection.query(sqld, (error, dt, fields) => {
        if (error) { return console.log(error.message); }
        if(dt.length >0){
          var sqlL=" DELETE FROM cron_tab  WHERE id < '"+  dt[0].id +"' and isComplate =true ";
          console.log("sql is :",sqlL);
          connection.query(sqlL, (error, results, fields) => {
            if (error) { return console.log(error.message); }
            console.log(sqlL);
          });
        }
      });
    });
  }catch(Err){
    console.log("Error ==>", Err);
  }
});

function syncPresetDataApi(){
  let Query=[{"$lookup":{"localField":"presetID","from":"job_presets","foreignField":"ID","as":"joincollection"}}];
    Mdb.bynder_jobs.aggregate( Query ,function(err, data) {
    if(data.length>0){
      var duplicat=new Array();
      for(let i=0; i< data.length; i++){
       var dt= data[0].joincollection;
       if(dt.length == 0){
         getPresetByJobs('getPresetByJobs', data[0].presetID); 
       }else if(dt.length  >1){
         duplicat.push( data[0].presetID );
       }
      }
      res.send(duplicat);
    }
  });
}

function getPresetByJobs( action, id){
  var request_data=appConfig.getActionInfo(action, id);
  var token=appConfig.getToken();
  console.log(request_data);
	request({
		url: request_data.url,
		method: request_data.method,
		form: request_data.data,
		headers: oauth.toHeader(oauth.authorize(request_data, token))
	}, function(error, response, body) {
    if(error){
      console.log("data now found error :",error, action, id );
    }else if(response.body.indexOf('<!doctype html>')!=-1){
      console.log('data not found is presetID is ==> : ',response.body);
      var myquery = { presetID : id };
      var newvalues = { $set: { loadMeta : true } };
            Mdb.bynder_jobs.updateMany(myquery, newvalues ).then((dd) => {
              console.log("database updated successfully presetID",id, dd);
            }).catch((err) => {
               console.log("unable to updated to database",  id, err);
            });
    }else{
      var JobsPresets = JSON.parse(response.body);
      JobsPresets = JobsPresets.preset;
      Mdb.job_presets.find({ID: JobsPresets.ID} , function(err ,docs){
        if(err){
          console.log("data error :", err);
        }else{
          if(docs.length > 0){
            var where ={ID: JobsPresets.ID};
            var set={ $set:{ 
              name : JobsPresets.name, 
              ftp_settings : JobsPresets.ftp_settings, 
                wf_uuid: JobsPresets.wf_uuid, 
                presetstages : JobsPresets.presetstages
              }
            };
            Mdb.job_presets.updateOne( where, set ).then((dd) => {
                console.log('job_presets updated ', JobsPresets.ID, dd);
            }).catch((Err) => {
                console.log("given job_presets Error ==>:",JSON.stringify(where), JSON.stringify(set), Err );
            });
            updateJobPresetisLoaded(JobsPresets.ID);
          }else {
            console.log("data for Save "+ JobsPresets.ID);
            new Mdb.job_presets(JobsPresets).save().then(() => {
              updateJobPresetisLoaded(JobsPresets.ID);
              console.log('JobsPresets added successfully id:'+ JobsPresets.ID );
            }).catch(() => {
              console.log("Not saved!", JobsPresets);
            });
          }
        }
      });
    }
  });
}
postRoutes.route('/Retrieve_all_campaigns').get(function (req, res) {
  const request_data = {
	  url: 'https://greatminds.getbynder.com/api/workflow/campaigns/',
	  method: 'GET',
	  data: { status: 'Hello Ladies + Gentlemen, a signed OAuth request!' }
	};
	request({
		url: request_data.url,
		method: request_data.method,
		form: request_data.data,
		headers: oauth.toHeader(oauth.authorize(request_data, token))
	}, function(error, response, body) {
		console.log('Retrieve_all_campaigns','statusCode:', JSON.stringify(response.body));
    res.send(response.body);
  //we have all data need for updating
    var campaignDt = JSON.parse(response.body);
      for(let k=0; k< campaignDt.length; k++){
        Mdb.campaign.find({ID: campaignDt[k].ID }).then((rsdata)=>{
          console.log("data is ==>",rsdata.length);
          if(rsdata.length){
            console.log('data needs to Update');
            var where={ ID: campaignDt[k].ID };
            var update={ $set:{
              name: campaignDt[k].name,
              key: campaignDt[k].key,
              dateStart: campaignDt[k].dateStart,
              deadline: campaignDt[k].deadline,
              description: campaignDt[k].description,
              dateCreated: campaignDt[k].dateCreated,
              responsibleID: campaignDt[k].responsibleID,
              accountID: campaignDt[k].accountID,
              createdByID: campaignDt[k].createdByID ,
              dateModified: campaignDt[k].dateModified,
              closed: campaignDt[k].closed,
              campaignMetaproperties: campaignDt[k].campaignMetaproperties,
              presetID: campaignDt[k].presetID ,
              thumbnailURL: campaignDt[k].thumbnailURL
            }};
            console.log( JSON.stringify(update), where ,'\n');
            Mdb.campaign.updateOne(where, update).then(() => {
              console.log('campaign in updated successfully campaign.ID ==> ',campaignDt[k].ID );
             }).catch((Err) => {
               console.log("unable to updated to database in campaign.ID==>", campaignDt[k].ID, Err );
             });
          }else{
            var  campaign=new Mdb.campaign(campaignDt[k]);
            campaign.save().then(() => {
              console.log('business in added successfully campaign.ID ==>', campaignDt[k] );
             }).catch(() => {
               console.log("unable to save to database campaign.ID==>", campaignDt[k]);
             });
          }
        }).catch((Err)=> {
          console.log("find campaign query have some error ==>", Err);
        });
      }
	});
});
postRoutes.route('/metapropertiesbyid/:metaid').get(function (req, res) {
  let metaid = req.params.metaid;
  var request_data=appConfig.getActionInfo("metapropertiesbyid", metaid);
   console.log(request_data);
  var token=appConfig.getToken();
  request({
    url: request_data.url,
    method: request_data.method,
    form: request_data.data,
    headers: oauth.toHeader(oauth.authorize(request_data, token))
	}, function(error, response, body) {
    res.send(response.body);
  });
});

postRoutes.route('/metaproperties/').get(function (req, res) {
  console.log("metaproperties", "API Calling");
  const request_data = {
	  url: `https://greatminds.getbynder.com/api/workflow/metaproperties/`,
	  method: 'GET',
	  data: { status: 'Hello Ladies + Gentlemen, a signed OAuth request!' }
	};
	request({
		url: request_data.url,
		method: request_data.method,
		form: request_data.data,
		headers: oauth.toHeader(oauth.authorize(request_data, token))
	}, function(error, response, body) {
    console.log('metaproperties','statusCode:', response.statusCode);
    var metapropertiesData = JSON.parse(response.body);
    console.log(JSON.stringify(metapropertiesData));
    for(let k=0; k< metapropertiesData.length; k++){
      metapropertiesData[k].tempId  = metapropertiesData[k].ID.split("-").join("");
      Mdb.metaproperties.find({ ID: metapropertiesData[k].ID }).then((dt)=>{
        console.log("data is ==>", dt.length, metapropertiesData[k].ID);
        if(dt.length >0 ){
            var where={ ID: metapropertiesData[k].ID };
            var set={ $set:{
              options : metapropertiesData[k].options,
              parts : metapropertiesData[k].parts,
              numericID : metapropertiesData[k].numericID,
              label : metapropertiesData[k].label,
              short_name : metapropertiesData[k].short_name,
              type : metapropertiesData[k].type,
              entity : metapropertiesData[k].entity,
              dateCreated : metapropertiesData[k].dateCreated,
              accountID : metapropertiesData[k].accountID,
              position : metapropertiesData[k].position,
              default : metapropertiesData[k].default,
              required : metapropertiesData[k].require,
              description : metapropertiesData[k].description,
              exportName : metapropertiesData[k].exportName,
              export : metapropertiesData[k].export,
              removed : metapropertiesData[k].removed,
              assetbank_metaproperty : metapropertiesData[k].assetbank_metaproperty,
              created_by : metapropertiesData[k].created_by,
              removed_by : metapropertiesData[k].removed_by,
              is_complex : metapropertiesData[k].is_complex,
              dependencyValue : metapropertiesData[k].dependencyValue,
              dependency : metapropertiesData[k].dependency,
              tempId : metapropertiesData[k].tempId
            }};
            Mdb.metaproperties.updateOne(where, set ).then((dts)=>{
              console.log('Data updated successfully metaproperties.ID:'+ metapropertiesData[k].ID , dts);
            }).catch((Err)=>{
              console.log('Unable to updated metaproperties.ID:'+ metapropertiesData[k].ID, Err);
            });
        }else{ 
          console.log( "=====>",metapropertiesData[k].ID ,"for saving");
          var  metaproperties=new Mdb.metaproperties(metapropertiesData[k]);
          metaproperties.save().then((dd) => {
           console.log('business in added successfully id:'+ metapropertiesData[k].ID, dd );
          }).catch(() => {
            console.log("unable to save to database", metapropertiesData[k].ID);
          });
        }
      }).catch((Err)=>{
        console.log("find Query have error ==>", Err);
      });
      }
		res.send("metaproperties => save data from db");
	});
});

postRoutes.route('/getPresetByJobs/:presetId').get(function (req, res) {
  let presetId = req.params.presetId;
  console.log('testing app /getPresetByJobs/:presetId', presetId);
  //res.send("hello testing 123"+presetId);
  const request_data = {
	  url: `https://greatminds.getbynder.com/api/workflow/presets/job/`+presetId ,
	  method: 'GET',
	  data: { status: 'Hello Ladies + Gentlemen, a signed OAuth request!' }
  };
  console.log(request_data.url);
	request({
		url: request_data.url,
		method: request_data.method,
		form: request_data.data,
		headers: oauth.toHeader(oauth.authorize(request_data, token))
	}, function(error, response, body) {

		res.send(response.body);
	});
});


// Defined delete | remove | destroy route
postRoutes.route('/updateriskimpact').get(function (req, res) {
  console.log("ACTION : updateriskimpact ");
  let Query=[
    // {$match: { "jobMetaproperties.309909b0de3f4eb9b5674efe59bee8b9": { $exists : true}, 
    //     "jobMetaproperties.f8bf767302224972a79fd80f7fb36d12":{ $exists : true}, }
    // }, 
    {$project :{ "risk":"$jobMetaproperties.309909b0de3f4eb9b5674efe59bee8b9", "impact":"$jobMetaproperties.f8bf767302224972a79fd80f7fb36d12", id:1, "Mkey": "$jobMetaproperties.ccf531b93d1c46428aa5c52bc8cc639f", job_key:1} }
  ];
  console.log(JSON.stringify(Query));
  Mdb.bynder_jobs.aggregate( Query ).then((data)=>{
    if(data.length > 0){
      console.log("total data is :", data.length);
      for(let k=0; k< data.length; k++){
        if(typeof data[k].risk !="undefined" && data[k].risk!=""){
          console.log("risk data=>",data[k].risk);
          Mdb.metaproperties.find({ "options.ID": data[k].risk.decode() }).then((ddata)=>{
          if(ddata.length > 0){
              for(let dd=0;  dd < ddata.length; dd++){
                var options=ddata[dd].options;
                for ( let ddd =0; ddd < options.length; ddd++){
                  if(options[ddd].default== true ){
                    var where={ id: data[k].id };
                    var set={ $set:{ risk: options[ddd].label }};
                    console.log("Query data:==>", where, JSON.stringify(set));
                    Mdb.bynder_jobs.updateOne(where, set ).then((dts)=>{
                      console.log('Data updated successfully id:'+ data[k].id , dts);
                    }).catch((Err)=>{
                      console.log('Unable to updated  :'+ data[k].id, Err );
                    });
                  }
                 }
              }
            } 
          }).catch((Err)=>{
            console.log("error to find in metaproperties", Err);
          });
        } //
        if(typeof data[k].impact !="undefined" && data[k].impact!=""){
          console.log(data[k].impact);
          Mdb.metaproperties.find({ "options.ID": data[k].impact.decode() }).then((ddata)=>{
          if(ddata.length > 0){
              for(let dd=0;  dd < ddata.length; dd++){
                var options=ddata[dd].options;
                for ( let ddd =0; ddd < options.length; ddd++){
                  if(options[ddd].default== true ){
                    var where={ id: data[k].id };
                    var set={ $set:{ impact: options[ddd].label }};
                    console.log("Query data:==>", where, JSON.stringify(set));
                    Mdb.bynder_jobs.updateOne(where, set ).then((dts)=>{
                      console.log('Data updated successfully id:'+ data[k].id , dts);
                    }).catch((Err)=>{
                      console.log('Unable to updated  :'+ data[k].id, Err );
                    });
                  }
                 }
              }
            } 
          }).catch((Err)=>{
            console.log("error to find in metaproperties",Err);
          });
        }
        if(typeof data[k].Mkey !="undefined" && data[k].Mkey!="" && ( typeof data[k].job_key =="undefined" || data[k].job_key=="" )){
          var set={ $set:{ job_key: data[k].Mkey }};
          console.log(set, "where",data[k].id);
         // process.exit("error::");
          Mdb.bynder_jobs.updateOne({id: data[k].id}, set ).then((dts)=>{
            console.log('Data updated successfully id:'+ data[k].id , dts);
          }).catch((Err)=>{
            console.log('Unable to updated  :'+ data[k].id, Err );
          });
        }
      }
    }
    //console.log(data);
    res.send(data);
  }).catch((Err)=>{
    console.log("error to fetch data ==>", Err);
  });
});
postRoutes.route('/jobbasedPreset').get(function (req, res) {
   Mdb.bynder_jobs.aggregate([{"$lookup":{"localField":"presetID","from":"job_presets","foreignField":"ID","as":"joincollection"}},
   {  $group: { _id: '$presetID',  id : { $first: '$id' }, name : { $first: '$joincollection' },  count: { $sum: 1 } }}
]).then((data)=>{
      var notFound=new Array();
      if(data.length> 0){
        for(let i=0; i< data.length; i++){
          if(data[i].name.length >0 ){
            var where={ presetID : data[i]._id };
            var update={ $set : { presetName: data[i].name[0].name, presetstages : data[i].name[0].presetstages } }; 
            console.log("Update data :", JSON.stringify(where), JSON.stringify(update));
            //process.exit();
              Mdb.bynder_jobs.updateMany( where , update).then((dt)=>{
                console.log("Update data :", JSON.stringify(where), JSON.stringify(update), dt );
              }).catch((Err)=>{
                console.log("Error In :", Err);
              });
          }else{
            notFound.push(data[i]);
          }
        }
        res.send(notFound);
      }
   }).catch((Err)=>{ console.log("Err=>", Err);});
});
function updatePresetData(data){
  try{
    if( !!data.presetID && data.presetID != null ){
      const request_data = { url: `https://greatminds.getbynder.com/api/workflow/presets/job/`+ data.presetID, method:'GET',data:{status:'Hello'}};
      console.log(request_data.url);
      request({ url: request_data.url, method: request_data.method, form: request_data.data, headers: oauth.toHeader(oauth.authorize(request_data, token))
      }, function(error, response, body) {
        if(error){
          console.log("data now found error :",error, action, id );
        }else if(response.body.indexOf('<!doctype html>')!=-1){
          console.log('data not found is presetID is ==> : ',response.body);
          var myquery = { presetID : id };
          var newvalues = { $set: { loadMeta : true , loadPreset : false} };
          Mdb.bynder_jobs.updateOne(myquery, newvalues ).then((dd) => { 
              console.log("flag updated",id, dd);
          }).catch((err) => {
              console.log("ERR Update:=>",  id, err);
          });
        }else{
          console.log("para", data);
          var JobsPresets = JSON.parse(response.body);
          JobsPresets = JobsPresets.preset;
          Mdb.job_presets.find({ID: JobsPresets.ID}).then((res)=>{
          //  console.log( "ssss",res.length, data);
            if(res.length ==0){
              //save data fron job_preset and update data from bynder_jobs
              var job_presets=new Mdb.job_presets(JobsResult);
              job_presets.save().then((res)=>{
                console.log("added data", res);
              }).catch((Err)=>{
                console.log("err=>", Err);
              });
              var where ={ id: data.id};
              var set={ $set: { presetName: JobsPresets.name, presetstages: JobsPresets.presetstages , loadPreset: true} };
              Mdb.bynder_jobs.updateOne( where, set).then((res)=>{
                console.log("update", res);
              }).catch((Err)=>{
                console.log("Err=>", Err);
              });
            }else{
              // update data from job_preset and update bynder_jobs also
              var where1={ ID: JobsPresets.ID }, set1={ $set:{ 
                name: JobsPresets.ID,
                presetstages: JobsPresets.presetstages
              } };
              Mdb.job_presets.updateOne( where1, set1).then((res)=>{
                console.log("update data", res);
              }).catch((Err)=>{
                console.log("err=>", Err);
              });
              var where ={ id: data.id};
              var set={ $set: { presetName: JobsPresets.name, presetstages: JobsPresets.presetstages , loadPreset: true} };
              Mdb.bynder_jobs.updateOne( where, set).then((res)=>{
                console.log("update", res);
              }).catch((Err)=>{
                console.log("Err=>", Err);
              });
            }
          }).catch((Err)=>{
            console.log("Error =>", Err);
          });
        }
      });
    }
  }catch(Err){
    console.log("Error In ", Err);
  }
}
postRoutes.route('/testData2/').get(function (req, res) {
  Mdb.bynder_jobs.find({job_key:"SCI-1092"},{ presetID:1, job_key:1,presetstages:1, presetName:1 }).then((data)=>{
    if(data.length> 0){
      updatePresetData(data[0]);
      res.send(data[0]);
    }
  }).catch((Err)=>{
    console.log("test=>", Err);
  });
});
module.exports = postRoutes;

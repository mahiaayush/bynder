const express = require('express');
const postRoutes = express.Router();
const request = require('request');
const OAuth   = require('oauth-1.0a');
const crypto  = require('crypto');
const fetch = require('node-fetch');
let mysql  = require('mysql');
var slashes = require('slashes');
let config = require('./Mysqlconfig.js');
function startConnection() {
  console.error('CONNECTING');
  connection = mysql.createConnection(config);
  connection.connect(function(err) {
      if (err) {
          console.error('CONNECT FAILED', err.code);
          startConnection();
      }
      else
          console.error('CONNECTED');
  });
  connection.on('error', function(err) {
      if (err.fatal)
          startConnection();
  });
}

startConnection();

let Mdb = require('./post.model');
let appConfig=require('./config');

//Array.prototype.insert = function ( index, item ) { this.splice( index, 0, item ); };
String.prototype.decode=function(){
  var a= this.split("");
  a.splice( 8, 0 , "-");
  a.splice( 13, 0 , "-");
  a.splice( 18, 0 , "-");
  a.splice( 23, 0 , "-");
  return a.join("");
};

const oauth = OAuth({
  consumer: { key: '71BEFFCC-2CC9-476D-93A8A79BB92BD87B', secret: 'a8de7d89165b8234405b35c83553a318' },
  signature_method: 'HMAC-SHA1', hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  }
});
const token = {
  key: 'E07A70F7-4145-44D6-AC53C771E792A609',
  secret: '2a044b35eebcb94d315b77f02a31a86b'
};
let UpdatingRequest= new Array(
  // { ID: 'ee19e14d-bdb9-407b-ab56-17292d585787' , ExeOrder: true, name:"Marketing"}, 
  // { ID: '12087c22-260a-4fb8-834e-d231c4c277a3' , ExeOrder: false , name: 'Geodes Readable Library'}, 
  // { ID: '3d39f53b-3123-4eb1-a3f1-274cd4160efe' , ExeOrder: false, name :"Wit & Wisdom"}, 
  { ID: '9618db88-fc78-47a5-9916-e864e696ae11' , ExeOrder: true, name: 'Eureka Math 2'}, 
 // { ID: '4924dc05-03c5-4086-90ce-41d8bf501684' , ExeOrder: false, name: "PhD Science"}, 
);
postRoutes.route('/synccampaignId').get(function (req, res) {
  var hostname="http://localhost:4000";
  for( let i=0; i<  UpdatingRequest.length ; i++){
    if(UpdatingRequest[i].ExeOrder==true){
      var targetURL= hostname+"/data/jobsbycampaignid/"+ UpdatingRequest[i].ID;
           excuteURL( targetURL );
           console.log("hitting ..", targetURL);
      res.send(UpdatingRequest[i]);
      UpdatingRequest[i].ExeOrder=false;
      if(i+1 < UpdatingRequest.length){
        UpdatingRequest[i+1].ExeOrder=true;
      }else{
        UpdatingRequest[0].ExeOrder=true;
      }
      break;
    }
  }
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
    if(error){
      console.log("API ERROR==>", error.message);
    }else if(response.body.indexOf("504 Gateway Time-out") >-1){
      console.log("API Response : ==>504 Gateway Time-out");
    }else{
      var compID=campaignId, JobsResult;
      try{
         JobsResult = JSON.parse(response.body);
      }catch(e){
        console.log("JSON ERROR In API RESOPNSE: ");
        var apiErrors=new Mdb.apiErrors({ responceData : response.body, description : e.message , errorDate: new Date()});
        apiErrors.save().then((rs) => {
          console.log(" api responce have Invalid JSON Sring that is saved ");
        }).catch((Err) => {
          console.log("saved Error:==>:",  Err);
        });
        JobsResult = new Array();
      }

      try{
        if(JobsResult.length >0 ){
          JobsResult= JobsResult.filter(dd=> new Date(dd.dateCreated) > new Date("2019-02-25"));
          var presetsforUpdating=[...new Set(JobsResult.map(x =>  x.presetID))];
          var campaignID=  JobsResult[0].campaignID , dataCount= JobsResult.length ;
          console.log("API RESPONDED ==>", JobsResult.length );
          //console.log(JobsResult[0])
          let sql = `INSERT INTO cron_tab set
          data= '`+ slashes.add( JSON.stringify(JobsResult) ) +`',
          dataPresets='`+ slashes.add( JSON.stringify(presetsforUpdating) ) +`',
          apiURL = '`+ campaignID +`',
          jobs = '`+ dataCount +`' `;
          //console.log("\n\n",sql,"\n\n");
          connection.query(sql ,function(err, result) {
            if(err){ console.log("Mysql Insert data Error: ", err.message); }
            if(result){ console.log("Mysql Insert data Sucess: ", result); }
          });
        }
      }catch(e){
        console.log("Error is :==>", e.message);
      }
    }
    res.send("done");
  });

});
postRoutes.route('/syncdatajobs').get(async function (req, res) {
  try{
      var refreshPresetRQIDs=new Array();
      let sql = `SELECT * FROM cron_tab where id in ( SELECT min(id) FROM cron_tab WHERE isComplate=false)`;
      connection.query(sql, (error, results) => {
    	  if (error) {  console.log(error.message); }
	      if( results.length >0 ){

          var mysqlID=results[0].id;
          console.log("start jobsync in campaign ID "+ results[0].apiURL );
	    	  //console.log("Data excuted : ID",mysqlID, "CampaignID:",results[0].apiURL, "JOBS",results[0].jobs);
          var JobsResult=JSON.parse(results[0].data);
          JobsResult= JobsResult.filter(dd=> new Date(dd.dateCreated) > new Date("2019-02-25"));
          var presetsforUpdating=[...new Set(JobsResult.map(x =>  x.presetID))];
          var jobsForUpdate=new Array();
          var movedCount=0, updatedID=new Array(); savedID=new Array();
          var saveSuccess=new Array();
	    	  for(let k=0; k< JobsResult.length; k++){
	    		  var avoidJobsID=new Array("adf84a7b-64a3-4315-9713-fdb3f61f691f","156d2215-69bf-4800-aebd-91b80f342e57", "dcf9d435-5400-49e1-a204-4010f237a72c", "88de0eef-5a29-4c5b-adb1-1306f5bab783", "ce7c38df-51da-4045-92c8-1fc035fae8b8","08be44fa-5ca2-4def-b213-ff9f5ddf88fe","15379fb4-ded4-4a7b-8d5a-9eb1bc4b173b","2b293143-6b50-4075-aed9-2bc7c8144c9f","e7cc232e-6869-46fa-99bf-250c9334e019","89af2131-2527-4418-80c6-ad3cead118f9","74979e90-20af-40ef-b0d5-5cca1c936aad","b316c54a-8419-4df6-8de2-e0ffa4e6f120","91f3db11-1e0e-41ea-a974-c1d3bd562baa","42da2b82-9a1e-48b5-af73-5a16b035638e","ee305287-f0b1-48ff-ac14-7435dbf2cf4c", "a76e8939-becb-4e93-9724-47d8825d96bf","c7b51762-acf8-48ce-9e8f-9d09a2291f93","fe842b52-05cb-4201-bee4-3169fe02b7b4", "22d2e518-3597-4e07-94ed-18732c221690","2b8a742d-daca-4c4e-bb60-4c8f2620671f","55234d0a-c0aa-48e6-8374-b41429817138","5af4c49d-1ff0-46cc-904d-0f5f7600900e","97f1ebf4-d35f-46ab-a7c7-b719b39792b1","c284d58c-efea-4a1b-8d29-a674110681f5","e38c76bc-4f4a-421f-9c55-ece7092cf71d","20fb382d-961c-4765-9bfb-46b7d3a9c23e","30087be0-c060-45d7-9231-df75bb73b792","518feaf1-895c-4fcc-895e-d4fe22d3c9fb","37768508-e952-494e-ba15-dcb00b9f658f","5c33feb5-e4cf-4ba0-adb8-5771ab7156f1","498e05b0-6755-4d7d-b20e-0e8493090ad7","6ac76c04-41ff-4522-897f-f6bd379a35fa", "f5a1d57c-9c0a-4ab6-9b29-abd54acc9767","5237a18e-b994-4078-8da6-dbd04f45c053","6f075f28-b600-4246-8679-bc99f3b52d95","6ceee960-7cf5-4404-b03e-cda11e764313","87e7b625-aa80-45c4-bdb8-3d5ca89c632d","c85e4b0d-5855-4935-8710-f168dbfa6642", "c3825c47-fc8e-40f3-9921-d236bdfa9019","d0fb96c7-3081-4589-87a4-31a18b05a4dd","79d661a9-d32a-4885-a2e1-568fc435d890", "898c68ac-4d5d-47ee-abf5-fb0e65b0ad00", "e01974b9-5ef6-410c-9a5d-8727923dc773","d238a3a0-a46d-4955-9ca3-40dbe3a7d282","f6e3d02e-d8c6-4109-9089-599202688684", "0597919f-842d-4d50-b21c-0b7b8ffcc6ab","6ad45656-1ad0-4e6d-a8c3-617aff42cc9c","e356dcbb-1616-4943-955b-fc01fd836959","b4f59eb0-d916-4414-a707-fcc2382d2c12","96f3ca27-13fe-468b-b53b-cfb45a49dcae","b6f6e004-28dd-4967-b80e-5dcc879292be","4f38e28b-2ed8-4ca9-a71e-10544c42415d","4a33845f-78a8-44ab-9359-fea885cc5295", "8fcc8e3f-2f69-45d7-964d-06e2300b12cb","209b469e-5e87-4c02-8ee0-4f317fe20dac");
	    		  var cond=true; for(let ttemp=0; ttemp < avoidJobsID.length; ttemp++){ if(avoidJobsID[ttemp] == JobsResult[k].id){ cond=false ; break; } }
	    		  if(cond /*&&  new Date (JobsResult[k].dateCreated) > new Date("2019-02-25")*/ ){
              var Query=[{"$lookup":{"localField":"presetID","from":"job_presets","foreignField":"ID","as":"joincollection"}}];
              Query.push({$match: { id: JobsResult[k].id }});
              //console.log("Job in process:", { id: JobsResult[k].id });
              //console.log("Mongo Qeury for checking ", JSON.stringify(Query));
              if(JobsResult[k].id=='6a1849ca-63a5-4c60-908a-f847071efed7'){
                console.log("data finding==>",JobsResult[k]);
              }
              Mdb.bynder_jobs.aggregate( Query ).then((docs)=>{
                if( docs.length >0 /*&& !serDocs.job_date_finished */  ){
                  /// if Job have job_date_finished then does't capture that stage moment
                  if(docs[0].id=='6a1849ca-63a5-4c60-908a-f847071efed7'){
                    console.log("data finded==>",JobsResult[k]);
                  }
                  let serDocs=docs[0];
                  if(docs.length > 1){
                    for( let anydt in docs){
                      if(typeof anydt.duplicat != "undefined"){
                        serDocs=docs[abydt];
                      }
                    }
                  }
                  if(!serDocs.job_date_finished){
                    if((!serDocs.hasOwnProperty("presetstages")) ||(serDocs.hasOwnProperty("presetstages")  && serDocs.presetstages.length == 0 )){
                      var presetUpdateData={id : serDocs.id, presetID: serDocs.presetID, for : "Save Jobs", isUpdate: false, updatedDate: new Date()};
                      var presetdataupdate= new Mdb.presetdataupdate(presetUpdateData);
                      presetdataupdate.save().then((rs) => {
                        console.log(" presetdataupdate for update Saved");
                      }).catch((Err) => {
                        console.log("unable to save presetdataupdate id:",  Err);
                      });
                    }
                    //-------  ---- - --------
                    var PresetData=[];
                    if(serDocs.hasOwnProperty("presetstages") ){
                      PresetData=serDocs.presetstages;
                    }else if(serDocs.joincollection.length >0){
                      PresetData=serDocs.joincollection[0].presetstages;
                    }
                    var NewPreset_Stages=new Array();
                    if(JobsResult[k].hasOwnProperty('job_active_stage') && serDocs.job_active_stage ){
                      var currentStage=JobsResult[k].job_active_stage;
                      var oldStage=serDocs.job_active_stage;
                      //console.log( "Stage Positon moment :", currentStage.position != oldStage.position);
                      if(currentStage.position != oldStage.position ){
                        var OldPreset_Stages=serDocs.Preset_Stages;
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
                      }
                      // current stage Name
                      var StageNames= PresetData.filter(data=>data.position==JobsResult[k].job_active_stage.position);
                      JobsResult[k].job_active_stage.StageNames=(StageNames.length >0)?StageNames[0].name:"";
                      var Current_job_active_stage =JobsResult[k].job_active_stage ;
                      Current_job_active_stage.start_date = new Date();
                      NewPreset_Stages.push( Current_job_active_stage );
                      if(NewPreset_Stages.length > serDocs.Preset_Stages.length){
                        var $set={};
                        if(NewPreset_Stages[0].hasOwnProperty("StageNames") && NewPreset_Stages[0].StageNames=="Complete Request Form"){
                          $set.dateCreated=NewPreset_Stages[0].job_date_finished;
                        }
                        if(JobsResult[k].job_active_stage.hasOwnProperty('status') &&  JobsResult[k].job_active_stage.status=="Approved"){
                          $set.job_date_finished=new Date();
                        }
                        if( typeof JobsResult[k].jobMetaproperties['ccf531b93d1c46428aa5c52bc8cc639f'] != "undefined"){
                          $set.job_key=JobsResult[k].jobMetaproperties['ccf531b93d1c46428aa5c52bc8cc639f'];
                        }
                        $set.jobMetaproperties=JobsResult[k].jobMetaproperties;
                        $set.job_previous_stage=JobsResult[k].job_previous_stage;
                        $set.job_active_stage=JobsResult[k].job_active_stage;
                        $set.job_next_stage=JobsResult[k].job_next_stage;
                        $set.Preset_Stages=NewPreset_Stages;
                        
                        Mdb.bynder_jobs.updateOne({ id : JobsResult[k].id , duplicate: {$exists: false} }, { $set : $set })
                          .then((res) => { 
                            // Mdb.bynder_jobs.updateMany({ id: JobsResult[k].id,  duplicate: {$exists: true}},{
                            //   $set: dupData
                            // }).then(d=>{
                            //   console.log("duplicate data Updated");
                            // });
                            console.log( JobsResult[k].id,"==>", res); })
                          .catch((Err) => { console.log("unable to updated bynder_jobs ID:", JobsResult[k].id, Err); });
                        // for duplicate data Update skip some Meta data
                        if(docs[0].id=='6a1849ca-63a5-4c60-908a-f847071efed7'){
                          console.log("data checking",docs[0]);
                        }
                        if(docs.length > 1){
                          for(let ddtt in docs){
                            if(  typeof docs[ddtt].duplicate != "undefined"){
                              updateDuplicateJobs(docs[ddtt], JobsResult[k], $set);
                            }
                          }
                        }
                      }else if(serDocs.job_active_stage.status!= JobsResult[k].job_active_stage.status){
                      // console.log("status changed", serDocs.id);
                        var job_date_finished="";
                        if(( serDocs.job_date_finished=="" || serDocs.job_date_finished==null ) && JobsResult[k].job_active_stage.status=="Approved"){
                            job_date_finished= new Date();
                        }
                        var NewPreset_Stages=serDocs.Preset_Stages;
                        if(NewPreset_Stages.length-1 >-1){
                            NewPreset_Stages[NewPreset_Stages.length-1].job_date_finished=new Date();
                        }
                        if(NewPreset_Stages.length >0){
                            //update all Stage Name if any changes //
                            for(let l=0; l< NewPreset_Stages.length; l++){
                                var StageNames= PresetData.filter(data=>data.position== NewPreset_Stages[l].position);
                                if(StageNames.length >0 ){
                                  NewPreset_Stages[l].StageNames=StageNames[0].name;
                                }else{
                                  console.log('stageName not found at ', JSON.stringify(serDocs))
                                }
                            }
                        }
                        var set={};
                        set.jobMetaproperties=JobsResult[k].jobMetaproperties;
                        set.job_previous_stage=JobsResult[k].job_previous_stage;
                        set.job_active_stage=JobsResult[k].job_active_stage;
                        set.job_next_stage=JobsResult[k].job_next_stage;
                        set.Preset_Stages=NewPreset_Stages;
                        if( typeof JobsResult[k].jobMetaproperties['ccf531b93d1c46428aa5c52bc8cc639f'] != "undefined"){
                          set.job_key=JobsResult[k].jobMetaproperties['ccf531b93d1c46428aa5c52bc8cc639f'];
                        }
                        let dupData={
                          jobMetaproperties   : JobsResult[k].jobMetaproperties,
                          job_previous_stage  : JobsResult[k].job_previous_stage,
                          job_active_stage    : JobsResult[k].job_active_stage,
                          job_next_stage      : JobsResult[k].job_next_stage,
                          Preset_Stages       : NewPreset_Stages
                        }
                        if(typeof job_date_finished!= "string"){ set.job_date_finished=job_date_finished; }
                        if(docs[0].id=='6a1849ca-63a5-4c60-908a-f847071efed7'){
                          console.log("data checking",docs[0]);
                        }
                        Mdb.bynder_jobs.updateOne({ id : JobsResult[k].id , duplicate: {$exists: false}}, { $set: set } ).then((dt) => {
                            //console.log( "Updated ID",JobsResult[k].id,"==>", dt);
                            // Mdb.bynder_jobs.updateMany({ id: JobsResult[k].id,  duplicate: {$exists: true}},{
                            //   $set: dupData
                            // }).then(d=>{
                            //   console.log("duplicate data Updated");
                            // });
                        }).catch((Err) => {
                            console.log("not updated bynder_jobs ID:", JobsResult[k].id, Err);
                        });
                        /*code for update duplicate jobs */
                        if(docs.length > 1){
                          for(let ddtt in docs){
                            if(  typeof docs[ddtt].duplicate != "undefined"){
                              updateDuplicateJobs(docs[ddtt], JobsResult[k], set);
                            }
                          }
                        }
                        /* end update duplicate jobs */
                      }
                    }
                  }
                }else{
                  //save code for bynder jobs
                  console.log("save job case");
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
                  if( typeof JobsResult[k].jobMetaproperties['ccf531b93d1c46428aa5c52bc8cc639f'] != "undefined"){
                    JobsResult[k].job_key=JobsResult[k].jobMetaproperties['ccf531b93d1c46428aa5c52bc8cc639f'];
                  }
                  //JobsResult[k].job_key=""; job_key should be update with meatupdate request
                  JobsResult[k].job_date_finished="";
                  JobsResult[k].Preset_Stages=MPS_Preset_Stages;
                  JobsResult[k].loadPreset=false;
                  JobsResult[k].loadMeta=false;
                  //console.log("process for Saved DATA ID: ", JobsResult[k].id);
                  var bynder_jobs=new Mdb.bynder_jobs(JobsResult[k]);
                  bynder_jobs.save().then((rs) => {
                    var presetUpdateData={id : JobsResult[k].id, presetID: JobsResult[k].presetID, for : "save Jobs", isUpdate: false, updatedDate: new Date()};
                    var presetdataupdate= new Mdb.presetdataupdate(presetUpdateData);
                    presetdataupdate.save().then((rs) => {
                      console.log("presetdataupdate for save saved")
                    }).catch((Err) => {
                      console.log("unable to save presetdataupdate :",  Err);
                    });
                  }).catch((Err) => {
                    console.log("unable to save bynder_job id:", JobsResult[k].id , Err);
                  });
                }
              }).catch((Err)=>{
                console.log("Err ddddd :", Err);
              });
            } // if data have length
          }
          var sql="update cron_tab set  isComplate =true where id= '"+ mysqlID+"'";
		      connection.query(sql);
	      }else{
          console.log("not found new update");
        }
	  res.send("data merged");
      var  sqld="select count(id) count, max(id) id from cron_tab where isComplate =true having count >1";
      connection.query(sqld, (error, dt, fields) => {
        if (error) { return console.log(error.message); }
        if(dt.length >0 /*&& dt[0].count > 1*/ ){

          var sqlL=" DELETE FROM cron_tab  WHERE id < '"+  dt[0].id +"' and isComplate =true ";
          //console.log("sql is :",dt[0],  sqlL);
          connection.query(sqlL, (error, results, fields) => {
            if (error) { return console.log(error.message); }
            console.log(sqlL);
          });
        }
      });
    });
    /// updatePresetData
  }catch(Err){
    console.log("Error ==>", Err);
  }
});
//updateDuplicateJobs(docs[ddtt], JobsResult[k]);
function updateDuplicateJobs(docs, JobsResult, $set){
   console.log("duplicate lesson found", docs);
    let Skip={
      lessonkey   : 'b447dc7d70b0420a8ac9ec9aeff78296',
      lessonletkey: '7b30e1d296d343bdaaffcb6be164a713',
      componentkey: '87d538e6d3a442468b20426285aef253',
      gradekey    : 'c0ac0a86e65f4f7ebd88dbd7e77965ef',
      modulekey   : 'b447dc7d70b0420a8ac9ec9aeff78296',
      batchkey    : '662315fccf37435081da009bd3fbe49b'
    }
    if(typeof JobsResult.jobMetaproperties[Skip.lessonkey] != "undefined" && typeof docs.jobMetaproperties[Skip.lessonkey] != "undefined"){
      JobsResult.jobMetaproperties[Skip.lessonkey] = docs.jobMetaproperties[Skip.lessonkey];
    }else if(typeof docs.jobMetaproperties[Skip.lessonkey] != "undefined"){
      JobsResult.jobMetaproperties[Skip.lessonkey] = docs.jobMetaproperties[Skip.lessonkey];
    }
    if(typeof JobsResult.jobMetaproperties[Skip.lessonletkey] != "undefined" && typeof docs.jobMetaproperties[Skip.lessonletkey] != "undefined"){
      JobsResult.jobMetaproperties[Skip.lessonletkey] = docs.jobMetaproperties[Skip.lessonletkey];
    }else if(typeof docs.jobMetaproperties[Skip.lessonletkey] != "undefined"){
      JobsResult.jobMetaproperties[Skip.lessonletkey] = docs.jobMetaproperties[Skip.lessonletkey];
    }
    if(typeof JobsResult.jobMetaproperties[Skip.componentkey] != "undefined" && typeof docs.jobMetaproperties[Skip.componentkey] != "undefined"){
      JobsResult.jobMetaproperties[Skip.componentkey] = docs.jobMetaproperties[Skip.componentkey];
    }else if(typeof docs.jobMetaproperties[Skip.componentkey] != "undefined"){
      JobsResult.jobMetaproperties[Skip.componentkey] = docs.jobMetaproperties[Skip.componentkey];
    }
    if(typeof JobsResult.jobMetaproperties[Skip.gradekey] != "undefined" && typeof docs.jobMetaproperties[Skip.gradekey] != "undefined"){
      JobsResult.jobMetaproperties[Skip.gradekey] = docs.jobMetaproperties[Skip.gradekey];
    }else if(typeof docs.jobMetaproperties[Skip.gradekey] != "undefined"){
      JobsResult.jobMetaproperties[Skip.gradekey] = docs.jobMetaproperties[Skip.gradekey];
    }
    if(typeof JobsResult.jobMetaproperties[Skip.modulekey] != "undefined" && typeof docs.jobMetaproperties[Skip.modulekey] != "undefined"){
      JobsResult.jobMetaproperties[Skip.modulekey] = docs.jobMetaproperties[Skip.modulekey];
    }else if(typeof docs.jobMetaproperties[Skip.modulekey] != "undefined"){
      JobsResult.jobMetaproperties[Skip.modulekey] = docs.jobMetaproperties[Skip.modulekey];
    }
    if(typeof JobsResult.jobMetaproperties[Skip.batchkey] != "undefined" && typeof docs.jobMetaproperties[Skip.batchkey] != "undefined"){
      JobsResult.jobMetaproperties[Skip.batchkey] = docs.jobMetaproperties[Skip.batchkey];
    }else if(typeof docs.jobMetaproperties[Skip.batchkey] != "undefined"){
      JobsResult.jobMetaproperties[Skip.batchkey] = docs.jobMetaproperties[Skip.batchkey];
    }
    $set.jobMetaproperties=JobsResult.jobMetaproperties;
    Mdb.bynder_jobs.updateOne({ _id : docs._id }, { $set : $set }).then(dupsr=>{
      console.log("Duplicate data Updated")
    });
}

postRoutes.route('/syncpresets').get(async function (req, res) {
  Mdb.presetdataupdate.find({isUpdate:false,  presetID:{$ne: null} }).limit(500).then(resdata=>{
    var presetsforUpdating=[...new Set(resdata.map(x =>  x.presetID))];
    
    for( let temp=0; temp< presetsforUpdating.length ; temp ++){
      var request_data=appConfig.getActionInfo("getPresetByJobs", presetsforUpdating[temp] ), token=appConfig.getToken();
      request({ url: request_data.url, method: request_data.method, form: request_data.data, headers: oauth.toHeader(oauth.authorize(request_data, token))
      },function(error, response, body) {
        if(error){
           console.log("data now found error :",error, action, id );
         }else if(response.body && response.body.indexOf('<!doctype html>')!=-1){
           console.log("Un-responcive Error formated as HTML");
         }else if(response.body && response.body.indexOf("504 Gateway Time-out") >-1){
           console.log("504 Gateway Time-out");
         }else{
           var Presets= JSON.parse(response.body);
           if(Presets.hasOwnProperty("preset")){
            var apiData=Presets.preset;
            //console.log(apiData);
            var filterdDt=resdata.filter(st=> st.presetID== apiData.ID);
            var jobsIDs= [...new Set(filterdDt.map(x =>  x.id))];
            var where ={  id: {  $in: jobsIDs } }
               var stages=new Array();
              for( let t =0 ; t< apiData.presetstages.length; t++){
                stages.push({
                   ID: apiData.presetstages[t].ID,
                   name : apiData.presetstages[t].name,
                   position : apiData.presetstages[t].position,
                });
              }
            var set={ $set:{ presetstages : stages, presetName : apiData.name}};
            console.log("Jobs Updating where jobs SET:", JSON.stringify(set), "\n Where :",JSON.stringify(where))
            Mdb.bynder_jobs.updateMany( where, set, {'multi':true} ).then((dd) => {
              console.log("Updated Presets",dd)
              Mdb.presetdataupdate.updateMany( where ,{$set:{ isUpdate:true }} ).then((dd) => console.log(dd)).catch(e=>console.log(e.message));
            }).catch(e=>console.log("Updated Presets Error",e.message));
           }
          }
      })
    }
    res.send(resdata);
  }).catch(err=>{ console.log(err.message)});
})

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
          console.log("Retrieve_all_campaigns data is ==>",rsdata.length);
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
        console.log("metapropertiesdata is ==>", dt.length, metapropertiesData[k].ID);
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
           console.log('business in added successfully id:'+ metapropertiesData[k].ID );
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
  //console.log(JSON.stringify(Query));
  Mdb.bynder_jobs.aggregate( Query ).then((data)=>{
    if(data.length > 0){
      //console.log("total data is :", data.length);
      for(let k=0; k< data.length; k++){
        if(typeof data[k].risk !="undefined" && data[k].risk!=""){
          //console.log("risk data=>",data[k].risk);
          Mdb.metaproperties.find({ "options.ID": data[k].risk.decode() }).then((ddata)=>{
          if(ddata.length > 0){
              for(let dd=0;  dd < ddata.length; dd++){
                var options=ddata[dd].options;
                for ( let ddd =0; ddd < options.length; ddd++){
                  if(options[ddd].default== true ){
                    var where={ id: data[k].id };
                    var set={ $set:{ risk: options[ddd].label }};
                    //console.log("Query data:==>", where, JSON.stringify(set));
                    Mdb.bynder_jobs.updateOne(where, set ).then((dts)=>{
                      //console.log('risk:'+ data[k].id );
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
          //console.log(data[k].impact);
          Mdb.metaproperties.find({ "options.ID": data[k].impact.decode() }).then((ddata)=>{
          if(ddata.length > 0){
              for(let dd=0;  dd < ddata.length; dd++){
                var options=ddata[dd].options;
                for ( let ddd =0; ddd < options.length; ddd++){
                  if(options[ddd].default== true ){
                    var where={ id: data[k].id };
                    var set={ $set:{ impact: options[ddd].label }};
                    //console.log("Query data:==>", where, JSON.stringify(set));
                    Mdb.bynder_jobs.updateOne(where, set ).then((dts)=>{
                    //  console.log('impact:'+ data[k].id , dts);
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
          //console.log(set, "where",data[k].id);
         // process.exit("error::");
          Mdb.bynder_jobs.updateOne({id: data[k].id}, set ).then((dts)=>{
            //console.log('Data updated successfully id:'+ data[k].id , dts);
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
            //console.log("Update data :", JSON.stringify(where), JSON.stringify(update));
            //process.exit();
              Mdb.bynder_jobs.updateMany( where , update).then((dt)=>{
                //console.log("Update data :", JSON.stringify(where), JSON.stringify(update), dt );
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
          console.log("data now found error :",error, "updatePresetData" );
        }else if(response.body.indexOf('<!doctype html>')!=-1){
        //  console.log('data not found is presetID is ==> : ',response.body);
          var myquery = { presetID : data.id };
          var newvalues = { $set: { loadMeta : true , loadPreset : false} };
          Mdb.bynder_jobs.updateOne(myquery, newvalues ).then((dd) => {
              //console.log("flag updated",id, dd);
          }).catch((err) => {
              console.log("ERR Update:=>",  id, err);
          });
        }else if(response.body.hasOwnProperty('statuscode')){
            console.log("Preset API responce Not correct:", response.body);
        }else{
          //console.log("para", data);
          var JobsPresets = JSON.parse(response.body);
          if(JobsPresets.hasOwnProperty('statuscode')){
            console.log("responce data ===>", JobsPresets);
          }else{


	        //console.log("data is ==>" ,JobsPresets , response);
          JobsPresets = JobsPresets.preset;
          JobsPresets.lastUpdated = new Date();

          Mdb.job_presets.find({ID: JobsPresets.ID}).then((res)=>{
          //  console.log( "ssss",res.length, data);
            if(res.length ==0){
              //save data fron job_preset and update data from bynder_jobs
              var job_presets=new Mdb.job_presets(JobsResult);
              job_presets.save().then((res)=>{
                //console.log("added data", res);
              }).catch((Err)=>{
                console.log("err=>", Err);
              });
              var where ={ id: data.id};
              var set={ $set: { presetName: JobsPresets.name, presetstages: JobsPresets.presetstages , loadPreset: true} };
              Mdb.bynder_jobs.updateOne( where, set).then((res)=>{
                //console.log("update", res);
              }).catch((Err)=>{
                console.log("Err=>", Err);
              });
            }else{
              // update data from job_preset and update bynder_jobs also
              var where1={ ID: JobsPresets.ID }, set1={ $set:{
                name: JobsPresets.ID,
                presetstages: JobsPresets.presetstages,
                lastUpdated : new Date()
              } };
              Mdb.job_presets.updateOne( where1, set1).then((res)=>{
                //console.log("update data", res);
              }).catch((Err)=>{
                console.log("err=>", Err);
              });
              var where ={ id: data.id};
              var set={ $set: { presetName: JobsPresets.name, presetstages: JobsPresets.presetstages , loadPreset: true} };
              Mdb.bynder_jobs.updateOne( where, set).then((res)=>{
                //console.log("update", res);
              }).catch((Err)=>{
                console.log("Err=>", Err);
              });
            }
          }).catch((Err)=>{
            console.log("Error =>", Err);
          });
        }// if res have statuscode: 401
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
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
  //hostname="http://greatmindsapi.mpstechnologies.com";
  Mdb.campaign.find({ ID:{$in:[
    //'0ad18ec8-8648-4d15-8681-2c3f4e0ee914',  //  workflow testing
    //'f2e038c4-9191-4480-a55e-2dc92d3f52e7',    //  Great Minds
    'ee19e14d-bdb9-407b-ab56-17292d585787',    //  Marketing
    '12087c22-260a-4fb8-834e-d231c4c277a3' ,    //  Geodes Readable Library
    '3d39f53b-3123-4eb1-a3f1-274cd4160efe',    //  Wit & Wisdom 
    /// '9618db88-fc78-47a5-9916-e864e696ae11',    //  Eureka Math 2
    ////'4924dc05-03c5-4086-90ce-41d8bf501684'    //  PhD Science 1500
  ]}}
    ).then((docs)=>{
      for(var i = 0;i < docs.length; i++){
        let k = i;
        // var URLexc = hostname+"/data/jobsbycampaignid/"+ docs[k].ID;
        // var options = { method: 'GET', url: URLexc, headers:{ 'Cache-Control': 'no-cache', 'User-Agent': 'request' }};
        // return new Promise(function(resolve, reject) {
        //    request.get(options, function(err, resp, body) {
        //          if (err) {
        //              reject(err);
        //          } else {
        //              resolve(JSON.parse(body));
        //          }
        //      });
        //  });
         //console.log("Compain ID is:", docs[k].ID , data);
        // console.log("Compain ID is:", docs[k].ID );
        // setTimeout(function(){
            excuteURL( hostname+"/data/jobsbycampaignid/"+ docs[k].ID );
          //}, (3000*10 )* (k + 1));
      }
      ///4924dc05-03c5-4086-90ce-41d8bf501684
      // var syncePresetUrl= hostname+"/data/syncPresetData";
      // excuteURL( syncePresetUrl );
      // var getMetaPropertys= hostname+"/data/metaproperties";
      // excuteURL( getMetaPropertys );
      // var users=hostname+"/data/users";
     //excuteURL( users );
     var updateriskimpact=hostname+"/data/updateriskimpact";
     //excuteURL( updateriskimpact );
     res.send("HI data is comming");
     //connection.end();
    }).catch((Err)=>{
      console.log("synccampaignId Error id");
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
      apiURL = '`+ campaignID +`',
      jobs = '`+ dataCount +`' `;
      //console.log(sql);
      connection.query(sql);
      }
     }catch(e){
      console.log("Error is :==>", e);
    }
    res.send("done");
	});
});
postRoutes.route('/syncdatajobs').get(function (req, res) {
  try{
      let sql = `SELECT * FROM cron_tab where id in ( SELECT min(id) FROM cron_tab WHERE isComplate=false)`;
      console.log(sql);
      connection.query(sql, (error, results, fields) => {
    	  if (error) { return console.log(error.message); }
	      if(results.length >0 ){
	    	  var mysqlID=results[0].id;
	    	  console.log("Data excuted : ID",mysqlID, "CampaignID:",results[0].apiURL, "JOBS",results[0].jobs);
	    	  var JobsResult=JSON.parse(results[0].data);
	    	  var movedCount=0, updatedID=new Array();savedID=new Array();
	    	  for(let k=0; k< JobsResult.length; k++){
	    		  var avoidJobsID=new Array("adf84a7b-64a3-4315-9713-fdb3f61f691f","156d2215-69bf-4800-aebd-91b80f342e57", "dcf9d435-5400-49e1-a204-4010f237a72c", "88de0eef-5a29-4c5b-adb1-1306f5bab783", "ce7c38df-51da-4045-92c8-1fc035fae8b8","08be44fa-5ca2-4def-b213-ff9f5ddf88fe","15379fb4-ded4-4a7b-8d5a-9eb1bc4b173b","2b293143-6b50-4075-aed9-2bc7c8144c9f","e7cc232e-6869-46fa-99bf-250c9334e019","89af2131-2527-4418-80c6-ad3cead118f9","74979e90-20af-40ef-b0d5-5cca1c936aad","b316c54a-8419-4df6-8de2-e0ffa4e6f120","91f3db11-1e0e-41ea-a974-c1d3bd562baa","42da2b82-9a1e-48b5-af73-5a16b035638e","ee305287-f0b1-48ff-ac14-7435dbf2cf4c", "a76e8939-becb-4e93-9724-47d8825d96bf","c7b51762-acf8-48ce-9e8f-9d09a2291f93","fe842b52-05cb-4201-bee4-3169fe02b7b4", "22d2e518-3597-4e07-94ed-18732c221690","2b8a742d-daca-4c4e-bb60-4c8f2620671f","55234d0a-c0aa-48e6-8374-b41429817138","5af4c49d-1ff0-46cc-904d-0f5f7600900e","97f1ebf4-d35f-46ab-a7c7-b719b39792b1","c284d58c-efea-4a1b-8d29-a674110681f5","e38c76bc-4f4a-421f-9c55-ece7092cf71d","20fb382d-961c-4765-9bfb-46b7d3a9c23e","30087be0-c060-45d7-9231-df75bb73b792","518feaf1-895c-4fcc-895e-d4fe22d3c9fb","37768508-e952-494e-ba15-dcb00b9f658f","5c33feb5-e4cf-4ba0-adb8-5771ab7156f1","498e05b0-6755-4d7d-b20e-0e8493090ad7","6ac76c04-41ff-4522-897f-f6bd379a35fa", "f5a1d57c-9c0a-4ab6-9b29-abd54acc9767","5237a18e-b994-4078-8da6-dbd04f45c053","6f075f28-b600-4246-8679-bc99f3b52d95","6ceee960-7cf5-4404-b03e-cda11e764313","87e7b625-aa80-45c4-bdb8-3d5ca89c632d","c85e4b0d-5855-4935-8710-f168dbfa6642", "c3825c47-fc8e-40f3-9921-d236bdfa9019","d0fb96c7-3081-4589-87a4-31a18b05a4dd","79d661a9-d32a-4885-a2e1-568fc435d890", "898c68ac-4d5d-47ee-abf5-fb0e65b0ad00", "e01974b9-5ef6-410c-9a5d-8727923dc773","d238a3a0-a46d-4955-9ca3-40dbe3a7d282","f6e3d02e-d8c6-4109-9089-599202688684", "0597919f-842d-4d50-b21c-0b7b8ffcc6ab","6ad45656-1ad0-4e6d-a8c3-617aff42cc9c","e356dcbb-1616-4943-955b-fc01fd836959","b4f59eb0-d916-4414-a707-fcc2382d2c12","96f3ca27-13fe-468b-b53b-cfb45a49dcae","b6f6e004-28dd-4967-b80e-5dcc879292be","4f38e28b-2ed8-4ca9-a71e-10544c42415d","4a33845f-78a8-44ab-9359-fea885cc5295", "8fcc8e3f-2f69-45d7-964d-06e2300b12cb","209b469e-5e87-4c02-8ee0-4f317fe20dac");
	    		  var cond=true;
	    		  for(let ttemp=0; ttemp<avoidJobsID.length; ttemp++){
	    	          if(avoidJobsID[ttemp] == JobsResult[k].id){ cond=false ; break; }
	    	      }
	    		  if(cond &&  new Date (JobsResult[k].dateCreated) > new Date("2019-02-25")){
	    			  Mdb.bynder_jobs.find({id: JobsResult[k].id}, function(error ,docs){ 
	    				  if (error) { return console.log(error); }
                else if(docs.length >0){ //update data
                            console.log("ID: ", JobsResult[k].presetID);
                            Mdb.job_presets.find({ID: JobsResult[k].presetID}).then((data)=>{
                            if(data.length>0){
                              var PresetData=data[0].presetstages;
                              var bynder_jobs=new Mdb.bynder_jobs();
                              var NewPreset_Stages=[];
                              if(JobsResult[k].hasOwnProperty('job_active_stage') && docs[0].job_active_stage){
                                  var currentStage=JobsResult[k].job_active_stage;
                                  var oldStage=docs[0].job_active_stage;
                                  if(currentStage.position != oldStage.position ){
                                        updatedID.push(docs[0].id); movedCount++; 
                                            var OldPreset_Stages=docs[0].Preset_Stages;
                                            for(let num=0; num< OldPreset_Stages.length; num++){
                                                if(num==(OldPreset_Stages.length-1)){
                                                  console.log("PresetData data value", PresetData);
                                                    var StageNames= PresetData.filter(data=>data.position==OldPreset_Stages[num].position);
                                                    
                                                    OldPreset_Stages[num].StageNames=StageNames[0].name;
                                                    OldPreset_Stages[num].job_date_finished=new Date();
                                                    OldPreset_Stages[num].accuracy=true;
                                                }
                                                NewPreset_Stages.push(OldPreset_Stages[num]);
                                            }
                                            // also current job_previous_stage
                                            //console.log("data ==>", PresetData);
                                            var StageNames= PresetData.filter(data=>data.position==JobsResult[k].job_active_stage.position);
                                            JobsResult[k].job_active_stage.StageNames=StageNames[0].name;
                                            var Current_job_active_stage =JobsResult[k].job_active_stage ;
                                            Current_job_active_stage.start_date = new Date();
                                            NewPreset_Stages.push( Current_job_active_stage );
                                            if(NewPreset_Stages.length >0){
                                              for(var dtemp=0; dtemp < NewPreset_Stages.length; dtemp++){
                                                console.log("Old Stages name =>",NewPreset_Stages[dtemp].StageNames);
                                              }
                                            }
                                            //console.log("process exit code: ", StageNames,PresetData);
                                            //process.exit('testing under update');
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
                                                
                                              Mdb.bynder_jobs.updateOne({ id : JobsResult[k].id }, { $set: $set }).then((res) => {
                                                  console.log( JobsResult[k].id,"==>", res);
                                              }).catch((Err) => {
                                                  console.log("unable to updated bynder_jobs ID:", JobsResult[k].id, Err);
                                              });
                                            }
                                        }else if(docs[0].job_active_stage.status!= JobsResult[k].job_active_stage.status){
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
                                            var $set={
                                                jobMetaproperties : JobsResult[k].jobMetaproperties,
                                                job_previous_stage: JobsResult[k].job_previous_stage,
                                                job_active_stage: JobsResult[k].job_active_stage, 
                                                job_next_stage : JobsResult[k].job_next_stage, 
                                                Preset_Stages: NewPreset_Stages ,
                                                job_date_finished : job_date_finished 
                                            };
                                            Mdb.bynder_jobs.updateOne({ id : JobsResult[k].id }, { $set: $set } ).then((dt) => {
                                                console.log( "Updated ID",JobsResult[k].id,"==>", dt);
                                            }).catch((Err) => {
                                                console.log("not updated bynder_jobs ID:", JobsResult[k].id, Err);
                                            });
                                            console.log("process for Update ID: ", JobsResult[k].id);
                                        }
                                    }
                                }else{ console.log("preset Not Found "+ JobsResult[k].presetID, data);
                                    excuteURL("http://localhost:4000/data/syncPresetData");
                                    //save update all presets
                                }
                            }).catch((Err)=>{
                                console.log("Error to finding Preset Date :",Err);
                            });
	    					var sql="update cron_tab set  isComplate =true where id= '"+ mysqlID+"'";
		                    connection.query(sql);
	    				  }else{  //save data
                  var job_active_stage={
                      id: JobsResult[k].job_active_stage.id,
                      status: JobsResult[k].job_active_stage.status,
                      position : JobsResult[k].job_active_stage.position,
                  };

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
                    var sql="update cron_tab set  isComplate =true where id= '"+ mysqlID+"'";
                    connection.query( sql );
	    				  }
	    			  });
	    		  }
	    	  }
	      }else{
	    	  console.log("not found new update");
	      }
	  res.send("data merged");
      //console.log("updated record iD ==>",results[0].id);
      var sql="select max(id) id from cron_tab where isComplate =true";
      connection.query(sql, (error, dt, fields) => {
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
///
postRoutes.route('/re-syncPresetData').get(function (req, res) {
  Mdb.bynder_jobs.find({"loadPreset": false}).then((data)=>{
    var it=0;
    setTimeout(function(){ 
      
      getPresetByJobs('getPresetByJobs', data[it].presetID); 
      it++;
    }, 1000 );
  }).catch((Err)=>{
    console.log("data RE-sunc error");
  });

});

postRoutes.route('/syncPresetData').get(function (req, res) {
  setTimeout(function(){ syncPresetDataApi(); }, 1000 );
  console.log("syncPresetData function called! plz wait for res ==>");
  res.send("getPresetByJobs data working in backgroung ");
});
function syncPresetDataApi(){
  var d=[{ $match:{ $and:[ { "loadPreset": false },{"loadMeta": false}]}},{$limit: 1}];
  console.log("Query :", JSON.stringify(d));
  Mdb.bynder_jobs.aggregate( d ,function(err, result) {
    if(err){
      console.log(err);
    } else {
     console.log( "Loaded data is ::",result.length);
      for(var dt=0;  dt < result.length; dt++){
         d= result[dt].presetID;
         getPresetByJobs('getPresetByJobs', result[dt].presetID); 
      }
    }
  });
}
function updateJobPresetisLoaded(jobprestId){
  console.log("updateJobPresetisLoaded ================>", jobprestId);
  var myquery = { presetID : jobprestId };
  var newvalues = { $set: { loadPreset : true } };
  var multi={ multi : true };
        Mdb.bynder_jobs.updateMany(myquery, newvalues ).then(() => {
          console.log("database updated successfully presetID",jobprestId);
          setTimeout(function(){ syncPresetDataApi(); }, 1000);
        }).catch((err) => {
           console.log("unable to updated to database",  jobprestId);
        });
}
function getPresetByJobs( action, id){
  //console.log(action, id);
  
  var request_data=appConfig.getActionInfo(action, id);
  //console.log(request_data);
  //testing action excute end //
  var token=appConfig.getToken();
  console.log(request_data);
	request({
		url: request_data.url,
		method: request_data.method,
		form: request_data.data,
		headers: oauth.toHeader(oauth.authorize(request_data, token))
	}, function(error, response, body) {
    if(error){
      console.log("data now found error :",error);
      console.log("need get data from action :", action, id );
      //setTimeout(function(){ alert("Hello"); }, 300);
    }else if(response.body.indexOf('<!doctype html>')!=-1){
      console.log('data not found is presetID is ==> : ',response.body);
      var myquery = { presetID : id };
      var newvalues = { $set: { loadMeta : true } };
      var multi={ multi : true };
            Mdb.bynder_jobs.updateMany(myquery, newvalues ).then(() => {
              console.log("database updated successfully presetID",id);
              setTimeout(function(){ syncPresetDataApi(); }, 1000);
            }).catch((err) => {
               console.log("unable to updated to database",  id);
            });
    }else{
      var JobsPresets = JSON.parse(response.body);
      JobsPresets = JobsPresets.preset;
      console.log("====>data =======> ", JSON.stringify(JobsPresets));
      Mdb.job_presets.find({ID: JobsPresets.ID}, function(err ,docs){
        if(err){
          console.log("data error :", err);
        }else{
          if(docs.length > 0){
            console.log("data for updateing "+ JobsPresets.ID);
            //update query //
                  var  job_presets=new Mdb.job_presets();
                  var query=[{ID: JobsPresets.ID},
                  {
                    $set:{ 
                      name : JobsPresets.name, 
                      ftp_settings : JobsPresets.ftp_settings, 
                      wf_uuid: JobsPresets.wf_uuid, 
                      presetstages : JobsPresets.presetstages
                    }
                  }];
                  console.log("====>data =======> ", JSON.stringify(query));
                  job_presets.updateOne(query[0]).then(() => {
                          console.log('job_presets data updated successfully', JobsPresets.ID);
                         }).catch(() => {
                          console.log("given job_presets Error ==>:",JSON.stringify(query[0]) );
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

postRoutes.route('/users/').get(function (req, res) {
  var request_data=appConfig.getActionInfo("users");
   console.log(request_data);
  var token=appConfig.getToken();
  console.log(request_data);
	request({
		url: request_data.url,
		method: request_data.method,
		form: request_data.data,
		headers: oauth.toHeader(oauth.authorize(request_data, token))
	}, function(error, response, body) {

    console.log('UsersData','statusCode:', response.statusCode);
    var UsersData = JSON.parse(response.body);
    console.log( " data is ==>", JSON.stringify(UsersData) );
    for(let k=0; k< UsersData.length; k++){
      Mdb.users.find({ID: UsersData[k].ID}).then((dt)=>{
        console.log("Data Length :", dt.length);
        if(dt.length >0){
            var where={ ID: UsersData[k].ID};
            var set={ 
              $set:{
                fullName : UsersData[k].fullName,
                bynderUser :UsersData[k].bynderUser
                }
            };
            Mdb.users.updateOne(where, set).then((tda)=>{
              console.log("Update data Successfully users.ID"+UsersData[k].ID);
            }).catch((Err)=>{
              console.log("Unable to Update data users.ID"+UsersData[k].ID);
            });
        }else{
          var  users=new Mdb.users(UsersData[k]);
          users.save().then(() => {
           console.log('business in added successfully id:'+ UsersData[k] );
          }).catch(() => {
            console.log("unable to save to database", UsersData[k]);
            process.exit();
          });
        }
      }).catch((Err)=>{
        console.log("Data find Err :", Err);
      });
      }
    res.send("users => save data from db");
	});
});
postRoutes.route('/metaproperties/').get(function (req, res) {
  try{
    let metaId = req.params.metaId;
    console.log('testing app', metaId);
  }catch(e){

  }
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
      if( metapropertiesData[k].ID=="5b8e3535-6cc3-4330-8488-9a2a9579c552"){
        console.log(" data ID ==>",metapropertiesData[k].ID);
      }
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
            process.exit();
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
//https://greatminds.getbynder.com/api/workflow/presets/job/ff808081-6543-cfb5-0165-43e0c9560004
// Defined store route
postRoutes.route('/reloadpresets/').get(function (req, res) {
  Mdb.job_presets.find({}).then((data)=>{
    console.log(JSON.stringify(data[0].ID));
    for (let temp in data){
      const request_data = {  url: `https://greatminds.getbynder.com/api/workflow/presets/job/`+data[temp].ID , method: 'GET', data: { status: 'Hello Ladies + Gentlemen, a signed OAuth request!' }};
        console.log(request_data.url);
        request({  url: request_data.url, method: request_data.method, form: request_data.data, headers: oauth.toHeader(oauth.authorize(request_data, token)) }, function(error, response, body) {
          console.log('reloadpresets','statusCode:', response.statusCode);
          var presetData = JSON.parse(response.body);
         // console.log("Query data:==>", presetData.preset);
          var where={ ID: presetData.preset.ID};
          var set={ $set:{
            presetstages: presetData.preset.presetstages
          }};
            console.log("Query data:==>", where, JSON.stringify(set));
            Mdb.job_presets.update(where, set ).then((dts)=>{
              console.log('Data updated successfully job_presets.ID:'+ presetData.preset.ID);
            }).catch((Err)=>{
              console.log('Unable to updated job_presets.ID:'+ presetData.preset.ID);
            });
      });
    }
  }).catch((Err)=>{
    console.log("ERror in ==>", Err);
  });
});
postRoutes.route('/reloadjobspresets/').get(function (req, res) {
  Mdb.bynder_jobs.find({},{presetID:1}).then((data)=>{

    console.log(JSON.stringify(data[0].presetID));
    var counter = 0;
    var i = setInterval(function(){
    // do your thing
    const request_data = {  url: `https://greatminds.getbynder.com/api/workflow/presets/job/`+data[counter].presetID , method: 'GET', data: { status: 'Hello Ladies + Gentlemen, a signed OAuth request!' }};
        console.log(request_data.url);
        request({  url: request_data.url, method: request_data.method, form: request_data.data, headers: oauth.toHeader(oauth.authorize(request_data, token)) }, function(error, response, body) {
          console.log('reloadpresets','statusCode:', response.statusCode);
            var presetData = JSON.parse(response.body);
          // console.log("Query data:==>", presetData.preset);
            var where={ ID: presetData.preset.ID};
            var set={ $set:{
              presetstages: presetData.preset.presetstages
            }};
            console.log("Query data:==>", where, JSON.stringify(set));
            Mdb.job_presets.update(where, set ).then((dts)=>{
              console.log('Data updated successfully job_presets.ID:'+ presetData.preset.ID);
            }).catch((Err)=>{
              console.log('Unable to updated job_presets.ID:'+ presetData.preset.ID);
            });
      });
      counter++;
        if(counter === data.length) {
            clearInterval(i);
        }
    }, 300);
  }).catch((Err)=>{
    console.log("ERror in ==>", Err);
  });
});
// Defined delete | remove | destroy route
postRoutes.route('/updateriskimpact').get(function (req, res) {
  console.log("ACTION : updateriskimpact ");
  let Query=[
    {$match: { "jobMetaproperties.309909b0de3f4eb9b5674efe59bee8b9": { $exists : true}, 
        "jobMetaproperties.f8bf767302224972a79fd80f7fb36d12":{ $exists : true}, }
    }, 
    {$project :{ "risk":"$jobMetaproperties.309909b0de3f4eb9b5674efe59bee8b9", "impact":"$jobMetaproperties.f8bf767302224972a79fd80f7fb36d12", id:1} }
  ];
  Mdb.bynder_jobs.aggregate( Query ).then((data)=>{
    if(data.length > 0){
      console.log("total data is :", data.length);
      for(let k=0; k< data.length; k++){
        if(data[k].risk!=""){
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
                      console.log('Unable to updated  :'+ data[k].id );
                    });
                  }
                 }
              }
            } 
          }).catch((Err)=>{
            console.log("error to find in metaproperties");
          });
        } //
        if(data[k].impact!=""){
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
                      console.log('Unable to updated  :'+ data[k].id );
                    });
                  }
                 }
              }
            } 
          }).catch((Err)=>{
            console.log("error to find in metaproperties");
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
postRoutes.route('/testData/:campaignId').get(function (req, res) {
  let campaignId = req.params.campaignId;
  Mdb.bynder_jobs.find({id:campaignId},{Preset_Stages:1, job_active_stage:1, job_previous_stage:1,
     job_next_stage:1, job_stages:1, job_date_finished:1, job_duration:1 }).then((data)=>{
    res.send(data);
  }).catch((Err)=>{
    console.log("test=>", Err);
  });
});
postRoutes.route('/testData2/:campaignId').get(function (req, res) {
  let campaignId = req.params.campaignId;
  Mdb.bynder_jobs.find({job_key:campaignId},{Preset_Stages:1, dateCreated:1,  job_date_finished:1 }).then((data)=>{
    res.send(data);
  }).catch((Err)=>{
    console.log("test=>", Err);
  });
});
///=========
module.exports = postRoutes;
function dateDiffC(date1, date2){
  var dateFirst = date1;
  var dateSecond = date2;
  var timeDiff = Math.abs(dateSecond.getTime() - dateFirst.getTime());
  return  Math.ceil(timeDiff / (1000  *3600*  24))||0;
} 
function dateDiffinDuration(date1, date2){
  var dateFirst, dateSecond;
  if(!(date1 instanceof Date )){
    dateFirst = new Date (date1);
  }else{
    dateFirst = date1;
  }
  if(!(date2 instanceof Date )){
    dateSecond = new Date (date2);
  }else{
    dateSecond = date2;
  }
  var timeDiff = Math.abs(dateSecond.getTime() - dateFirst.getTime());
  return  Math.ceil(timeDiff / (1000  *3600*  24));
}
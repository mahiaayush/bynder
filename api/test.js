const express = require('express');
const test = express.Router();
const request = require('request');
const OAuth   = require('oauth-1.0a');
const crypto  = require('crypto');
const fetch = require('node-fetch');
let mysql  = require('mysql');
var slashes = require('slashes');
let config = require('./Mysqlconfig.js');
let connection = mysql.createConnection(config);
//const APIS = require('./service.config');
//var config = require('./config');
// Require Post model in our routes module
let Mdb = require('./post.model');
//let Bynder_jobs= require('./post.model');
let appConfig=require('./config');

// if(typeof console=="undefined"){
//   var console={};  
// }

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
test.route('/ismultiplePreset').get(function(req, res){
  Mdb.bynder_jobs.aggregate([{"$lookup":{"localField":"presetID","from":"job_presets","foreignField":"ID","as":"joincollection"}},

]).then((data)=> {
  var testingDT=new Array();
  if(data.length > 0 ){
    for(var i=0; i < data.length; i++){
      if(data[i].joincollection.length >1){
        console.log("JOBKEY :", data[i].job_key );
        testingDT.push( {id : data[i].id ,job_key: data[i].job_key, presetID: data[i].presetID, PresetData:data[i].joincollection   });
      }
      
    }
    //console.log(data)
  }
  res.send(testingDT);
}).catch((Err)=> console.log("Error in :",Err));
});


test.route('/testing').get(function (req, res) {
  console.log("\nACTION: testing \n");
  Mdb.bynder_jobs.find({ job_key :'SCI-1092'}).then((data)=>{
   // for(let t=0; t < data.length; t++){
      //if( data[t].deadline ){
    //  console.log( delete data[t].presetstages);  
      // data[t].delete("deadline");
        // data[t].delete("description");
        // data[t].delete("basedOnPreset");
        // data[t].delete("dateModified");
        // data[t].delete("dateModified");
        // data[t].delete("accountableID");
        // data[t].delete("isStartedFromBrandstore");
        // data[t].delete("useBrandstoreApproval");
        // data[t].delete("__v");
        // data[t].delete("accountableID");
        // data[t].delete("deadline");

        // delete data[t].description;
        // delete data[t].;
        // delete data[t].;
        // delete data[t].;
        // delete data[t].;
        // delete data[t].;
        // delete data[t].useBrandstoreApproval;
        // delete data[t].__v;
        // delete data[t].accountableID;
        
     // }
   // }
   data=  data.map((item)=> { 
        delete item.presetstages; 
        return item; 
    });
  //data=data.forEach(function(v){ delete v.presetstages });
  // var ress = [];
  // data.forEach(function(item) { 
  //     var tempItem = Object.assign({}, item);
  //     delete tempItem.presetstages; 
  //     ress.push(tempItem);
  // });
  //console.log(ress);

    res.send(data);
  }).catch((Err)=>{  console.log("Error in find", Err);});

  
//  Mdb.bynder_jobs.find({"jobMetaproperties.e9074f5b472f41d4a92ac511e53da775":{$exists: true, $ne:''}, jobID: '210a598980db43be9374deb9595e40ab'}).then((data)=>{
//   console.log(data.length);
//   for(let i=0; i< data.length; i++){
//     //console.log("data1 :",data[i].jobMetaproperties);
//     var mapObj=data[i].jobMetaproperties;
//     //console.log(mapObj.get("e9074f5b472f41d4a92ac511e53da775"));
//     //console.log("data2 :",data[i].jobMetaproperties.e9074f5b472f41d4a92ac511e53da775);
//     //break;
//     Mdb.bynder_jobs.updateOne({ _id: data[i]._id },{
//       $set:{ dateCreated : new Date( mapObj.get("e9074f5b472f41d4a92ac511e53da775") ) }
//     }).then((res)=>{ console.log(res);}).catch(Err=>{ console.log("err :", Err);} );  
//   }
//   res.send("data testing");
//  }).catch((Err)=>{
//   console.log("err", Err);
//  });
});

test.route('/apidata').get(function (req, res) {
  let campaignId = "9618db88-fc78-47a5-9916-e864e696ae11";
  var request_data=appConfig.getActionInfo("jobsbycampaignid", campaignId);
  var token=appConfig.getToken();
	request({url: request_data.url, method: request_data.method, form: request_data.data, headers: oauth.toHeader(oauth.authorize(request_data, token))
	}, function(error, response, body) {
    console.log("API responded ...", JSON.stringify(request_data));
    var compID=campaignId;
    var JobsResult = JSON.parse(response.body);
    JobsResult = var1.map(obj => ({prop1: obj.prop1, prop3: obj.prop3}));
    res.send(JobsResult);
	});
});
module.exports = test;
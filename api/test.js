var campaignId="0ad18ec8-8648-4d15-8681-2c3f4e0ee914";
var workflowPreset="Permissions";
var currentStatus=['Active','Comming up', 'Approved','Overdue','Closed'];
var jobType="05dedb54-4418-4ea7-89c6-18ef1d188bd5".split("-").join("");
var query=[];
    if(campaignId!=""){
        query.push({$match: { campaignID: { $eq: campaignId } } }) ;
    }
    var  lookup1={ $lookup:{ localField: "presetID",  from: "job_presets", foreignField : "ID",as: "joincollection"}};
    var  lookup2={ $lookup:{ localField: "createdByID", from: "users", foreignField : "ID", as: "joincollection2"}};
    var  lookup3={ $lookup:{ localField: "campaignID", from:"campaign",foreignField : "ID", as: "joincollection3" }};
  query.push(lookup1);
  query.push(lookup2);
  query.push(lookup3);


  /*
  { $match: {$and: [{ 'joincollection.name':{$regex:  new RegExp(".*Permissions.*") }},
  { 'job_active_stage.status':{$in:  ['Approved','Active'] }},
  //{'jobMetaproperties.e9074f5b472f41d4a92ac511e53da775':{$gte: '2018-09-26' }}, // job created  $lt
 // {'jobMetaproperties.57046bf7e7624ab5bc4b8e16664b4cf8':{$lte: '2018-10-04' }},  // deadline ISODate('2018-01-01T00:00:00.0Z')
  {'jobMetaproperties.262f92ed59b14c3aa74d6877d7f8ba4c':{$eq:'05dedb5444184ea789c618ef1d188bd5'}}
]  } }
*/
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
console.log("Quesy is :", JSON.stringify(query));
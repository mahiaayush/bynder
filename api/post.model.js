const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
let Schema = mongoose.Schema;
//.plugin(mongooseAggregatePaginate)
//Schema.plugin(mongooseAggregatePaginate);
//Define collection and schema for Post
let Post = new Schema({
  title: {
    type: String
  },
  body: {
    type: String
  }
},{
    collection: 'posts'
});
let ExportSheetData= new Schema({
    job_id : { type: String} ,
    job_name : { type: String} ,
    job_key : { type: String} ,
    preset_name : { type: String} ,
    curriculum_name : { type: String} ,
    type_of_requested_asset : { type: String} ,
    job_creator : { type: String} ,
    job_responsible : { type: String} ,
    job_date_started : { type: String} ,
    job_date_finished : { type: String} ,
    job_duration : { type: String} ,
    Preset_Stages : { type: Array}, 
},{
  collection: 'ExportSheetData'
});
let delete_temp_data=new Schema({
  jobID: { type: String},
  deletedDate: { type: String},
  userBy: { type: String},
},{collection: 'delete_temp_data'});
let overdue_jobs= new Schema({
	asset_typeId : { type: String},
	asset_type : { type: String},
	tat : { type: Number},
 },{
    collection: 'overdue_jobs'
});
let bynder_jobs= new Schema({
  id: { type: String},
  jobID:{type:String},
  risk:{type: String},
  impact:{type: String},
  name: { type: String},
  deadline: { type: String},
  description: { type: String},
  dateCreated: { type:  Date },
  job_date_started: { type:  Date },
  basedOnPreset: Boolean,
  presetID: { type: String},
  presetName: { type: String},
  presetstages:{ type: Array}, 
  dateModified: { type: String},
  campaignID: { type: String},
  job_previous_stage :{ type: Map},
  job_active_stage : { type: Map },
  job_next_stage : { type: Map },
  job_stages:{ type : Array },
  job_key : { type:  String },
  job_date_finished : { type:  Date },
  job_duration : { type:  String },
  Preset_Stages : { type:  Array },
  presetDataC:{type: Array},
  autoStage:{type: Array},
  accountableID: { type: String},
  createdByID: { type: String},
  jobMetaproperties:{ type: Map},
  isStartedFromBrandstore: { type: Boolean},
  useBrandstoreApproval: { type: Boolean},
  loadPreset:{ type: Boolean},
  loadMeta:{ type: Boolean},
  isMerged:{type : Boolean},
  isUpdated:{type : Boolean}
 },{
    collection: 'bynder_jobs'
});
//bynder_jobs.plugin(mongooseAggregatePaginate);

  let job_presets= new Schema({
       ID: { type: String} ,
       name: { type: String},
       ftp_settings: { type: Map},
       wf_uuid:{ type: String},
       presetstages: { type: Array},
      
    },{
        collection: 'job_presets'
    });
    let metaproperties=new Schema({
      ID: { type: String} ,
      tempId: { type: String} ,
      numericID: { type: String} ,
      label: { type: String} ,
      short_name: { type: String} ,
      type: { type: String} ,
      entity: { type: String} ,
      dateCreated: { type: String} ,
      accountID: { type: String} ,
      position: { type: String} ,
      default: { type: String} ,
      required: { type: String} ,
      description: { type: String} ,
      exportName: { type: String} ,
      export: { type: Boolean} ,
      removed: { type: Boolean} ,
      assetbank_metaproperty: { type: Map} ,
      created_by: { type: Map} ,
      removed_by: { type: Map} ,
      is_complex: { type: Boolean} ,
      dependencyValue: { type: String} ,
      dependency: { type: Map} ,
      options: { type: Array} ,
      parts: { type: Array} ,
    },{
      collection: 'metaproperties'
  });
  let users=new Schema({
    ID: { type: String} ,
    fullName: { type: String} ,
    bynderUser: { type: Map} ,
},{
  collection: 'users'
});
let campaign=new Schema({
  ID: { type: String} ,
  name: { type: String} ,
  key: { type: String} ,
  dateStart: { type: String} ,
  deadline: { type: String} ,
  description: { type: String} ,
  dateCreated: { type: String} ,
  responsibleID: { type: String} ,
  accountID: { type: String} ,
  createdByID: { type: String} ,
  dateModified: { type: String} ,
  closed: { type: Boolean} ,
  campaignMetaproperties: { type: Map} ,
  presetID: { type: String} ,
  thumbnailURL: { type: String} ,
},{ collection: 'campaign'});
    let Mdb={
      post: mongoose.model('Post', Post),
      job_presets: mongoose.model('job_presets', job_presets),
      bynder_jobs: mongoose.model('bynder_jobs', bynder_jobs),
      metaproperties : mongoose.model('metaproperties', metaproperties),
      users: mongoose.model('users', users),
      campaign: mongoose.model('campaign', campaign),
      ExportSheetData: mongoose.model('ExportSheetData', ExportSheetData),
      delete_temp_data: mongoose.model('delete_temp_data', delete_temp_data),
      overdue_jobs:mongoose.model('overdue_jobs', overdue_jobs),
    };
  module.exports = Mdb;
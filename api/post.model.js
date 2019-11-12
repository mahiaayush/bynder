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
    job_previous_stage :{ type: Object},
    job_active_stage:{ type: Object },
    job_next_stage:{ type:Object },
    job_stages:{ type : Array },
    job_key : { type:  String },
    job_date_finished : { type:  Date },
    job_duration : { type:  String },
    Preset_Stages : { type:  Array },
    presetDataC:{type: Array},
    autoStage:{type: Array},
    jobMetaproperties:{ type: Map},
    loadPreset:{ type: Boolean},
    loadMeta:{ type: Boolean},
    isMerged:{type : Boolean},
    isUpdated:{type : Boolean},
    duplicate:{type: Boolean}
   },{
      collection: 'bynder_jobs'
  });
  //bynder_jobs.plugin(mongooseAggregatePaginate);
  
    let job_presets= new Schema({
         ID: { type: String} ,
         name: { type: String},
         ftp_settings: { type: Map},
         wf_uuid:{ type: String},
         presetstages : { type: Array},
         lastUpdated : {type : Date }
      },{
          collection: 'job_presets'
      });
      let presetdataupdate= new Schema({
        id   : {type: String},
        presetID : { type: String },
        for      : {type: String },
        isUpdate : { type: Boolean},
        updatedDate: { type : Date} 
      },{
        collection: 'presetdataupdate'
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
  //   let users=new Schema({
  //     ID: { type: String} ,
  //     fullName: { type: String} ,
  //     bynderUser: { type: Map} ,
  // },{
  //   collection: 'users'
  // });
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
  let asset=new Schema({
    id: { type: String} ,
      name: { type: String} ,
      description: { type: String} ,
      idHash : { type: String} ,
      brandId : { type: String} ,
      archive : { type: String} ,
      copyright : { type: String} ,
      type : { type: String} ,
      datePublished : { type: String} ,
      dateCreated : { type: String} ,
      userCreated : { type: String} ,
      dateModified : { type: String} ,
      isPublic : { type: String} ,
      extension : { type: Array},
      width : { type: String} ,
      height : { type: String} ,
      fileSize : { type: String} ,
      orientation : { type: String} ,
      tags : { type: Array},
      propertyOptions : { type: Array},
      watermarked : { type: String} ,
      limited : { type: String} ,
      thumbnails : { type: Map},
      property_curricula_wip : { type: Array },
      property_workflowjob : { type: Array},
      property_assetsubtype : { type: Array},
      property_workflowjobkey : { type: Array},
      property_source : { type: Array},
      property_print_ready : { type: Array},
      property_sourcefile : { type: Array},
      property_assettype : { type: Array},
      property_usedfor: { type: Array},
      property_usagestatus: { type: Array},
      property_usageinstructions: { type: String} ,
      property_usagenotes: { type: String} ,
      views: { type: String} ,
      downloads: { type: String} ,
      activeOriginalFocusPoint: { type: Map}
  },{
        collection: 'asset'
    });
    let apiErrors=new Schema({
      id: { type: String} ,
        responceData: { type: String} ,
        description: { type: String} ,
        errorDate : {type: Date}
    },{
          collection: 'apiErrors'
      });
      let Mdb={
        post: mongoose.model('Post', Post),
        asset: mongoose.model('asset', asset),
        apiErrors: mongoose.model('apiErrors', apiErrors),
        job_presets: mongoose.model('job_presets', job_presets),
        bynder_jobs: mongoose.model('bynder_jobs', bynder_jobs),
        presetdataupdate: mongoose.model('presetdataupdate', presetdataupdate),
        metaproperties : mongoose.model('metaproperties', metaproperties),
        //users: mongoose.model('users', users),
        campaign: mongoose.model('campaign', campaign),
        ExportSheetData: mongoose.model('ExportSheetData', ExportSheetData),
        delete_temp_data: mongoose.model('delete_temp_data', delete_temp_data),
        overdue_jobs:mongoose.model('overdue_jobs', overdue_jobs),
      };
    module.exports = Mdb;
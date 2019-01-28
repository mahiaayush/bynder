const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

let bynder_jobs= new Schema({
 id: { type: String},
 jobID:{type:String},
  name: { type: String},
  deadline: { type: String},
  description: { type: String},
  dateCreated: { type: String},
  basedOnPreset: Boolean,
  presetID: { type: String},
  dateModified: { type: String},
  campaignID: { type: String},
  job_previous_stage :{ type: Map},
  job_active_stage:{type: Map},
  accountableID: { type: String},
  createdByID: { type: String},
  jobMetaproperties:{ type: Map},
  isStartedFromBrandstore: { type: Boolean},
  useBrandstoreApproval: { type: Boolean},
  loadPreset:{ type: Boolean},
  loadMeta:{ type: Boolean},
 },{
    collection: 'bynder_jobs'
}
);
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
    };
  module.exports = Mdb;
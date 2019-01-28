const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for Post
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

module.exports = mongoose.model('Post', Post);

let bynder_jobs= new Schema({
 id: { type: String},
  name: { type: String},
  deadline: { type: String},
  description: { type: String},
  dateCreated: { type: String},
  basedOnPreset: Boolean,
  presetID: { type: String},
  dateModified: { type: String},
  campaignID: { type: String},
  job_previous_stage :{ type: Map},
  accountableID: { type: String},
  createdByID: { type: String},
  jobMetaproperties:{ type: Map},
  isStartedFromBrandstore: { type: Boolean},
  useBrandstoreApproval: { type: Boolean} }
);
module.exports = mongoose.model('bynder_jobs', bynder_jobs);
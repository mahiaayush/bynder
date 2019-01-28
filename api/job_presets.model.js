const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Define collection and schema for Post

  let job_presets= new Schema({
       ID: { type: String} ,
       name: { type: String},
       type: { type: String},
       description:{ type: String},
       position: { type: String},
       responsibleID: { type: String},
       responsibleGroupID: { type: String},
       restrictToGroupID: { type: String},
       editableBy: { type: String} 
    },{
        collection: 'job_presets'
    });
    module.exports = mongoose.model('job_presets', job_presets);
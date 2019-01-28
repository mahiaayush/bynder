<template>
<form @submit.prevent="frmDataSubmited">
  <div>
    <div class="row">
	  <div class="col-sm-12 mb-2"><h4>Bynder Executive Reporting - Job View</h4></div>
    <div class="col-12">
      <div class="card rounded-0">
        <div class="card-body">
          <div class="border-bottom pb-2">
            <div class="font-weight-bold">
              <h6><i class="fa fa-filter" aria-hidden="true"></i> Filter</h6>
            </div>
          </div>
          <div class=" row mt-12">
            <div class="col-md-3">
              <div class="form-group">
                <label for="formGroupExampleInput2">Workflow Preset</label>
                <select v-model="frm.workflowPreset" class="form-control" id="formGroupExampleInput2">
                <option value="">Please Select</option>
                <option v-if="WkPresets.length==0">Loading..</option>
                <option v-for="WkPreset in WkPresets" :value="WkPreset.text">{{WkPreset.text}}</option>   
                </select>
               <!-- <input v-model="frm.workflowPreset" type="text" class="form-control" id="formGroupExampleInput2" placeholder="Workflow Preset">-->
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label for="formGroupExampleInput2">Campaigns</label>
                <select v-model="frm.compaignId" @change="compaignIdChange()" class="form-control" id="exampleFormControlSelect1">
                  <option value="">Please Select</option>
                  <option  v-if="compaigns==''" >Loading ..</option>
                  <option 
                  v-for="compaign in compaigns"
                  :value="compaign.ID"
                  >{{compaign.name}}</option>
                </select>
              </div>
            </div>
           <div class="col-md-3">
              <div class="form-group">
                <label for="formGroupExampleInput2">Current Status</label>
              <div class="prices">
                <vue-tags-input placeholder="Current Status" 
                  v-model="frm.currentStatus1"
                  :tags="tags"
                  @tags-changed="newTags => tags = newTags"
                  :validation="validation"
                  :autocomplete-items="autocompleteItems"
                />
          </div>
              </div>
            </div>
           
          
            <div class="col-md-3">
              <div class="form-group">
                <label for="formGroupExampleInput2">Permission Job Type</label>
                 <select v-model="frm.jobType" class="form-control" id="jobstage">
                  <option value="">None Selected</option>
                  <option 
                  v-for=" jobType in jobTypes" :value="jobType.ID">
                  {{jobType.label}}</option>
                </select>
              </div>
            </div>
             </div>
          <div class=" row mt-12">
            <div class="col-md-3">
              <div class="form-group">
                <label for="frmGrade">Grade</label>
                 <select v-model="frm.grade" class="form-control" id="frmGrade">
                  <option value="">None Selected</option>
                  <option 
                  v-for=" Grd in Grade" :value="Grd.ID">
                  {{Grd.label}}</option>
                </select>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label for="frmModule">Module</label>
                 <select v-model="frm.modules" class="form-control" id="frmModule">
                  <option value="">None Selected</option>
                  <option 
                  v-for=" Mdl in Module" :value="Mdl.ID">
                  {{Mdl.label}}</option>
                </select>
              </div>
            </div>
          <div class="col-md-3">
              <div class="form-group">
                <label for="jobstartDate">Job Date Started</label>
                <input v-model="frm.startDate" type="date" class="form-control" id="jobstartDate">
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label for="jobEndDate">Job Date Completed</label>
                <input v-model="frm.endDate" type="date" class="form-control" id="jobEndDate">
              </div>
            </div>
             <!--<div class="col-md-2">
              <div class="form-group">
                <label for="jobstage">Job Stage</label>
                 <select class="form-control" id="jobstage">
                <option>None Selected</option>
              </select>
              </div>
            </div> -->
          </div>
         
        </div>
      </div>
    </div>
    <div class="col-12 text-right mt-2">
      <button class="btn btn-primary rounded-0" type="submit">Search</button>
    <!--  <button-spinner class="btn btn-primary rounded-0"
      :is-loading="isLoading" 
      :disabled="isLoading"
      :status="status">
    <span>Submit</span>
    </button-spinner> -->
     <!--<a class="btn btn-primary rounded-0" href="#" role="button">Search</a> -->
     <a class="btn btn-secondary rounded-0" href="#" role="button">Cancel</a>
    </div></div>
  </div>
</form>
</template>
<script>
  import VueButtonSpinner from 'vue-button-spinner';
  import VueTagsInput from '@johmun/vue-tags-input';
  import APIS from '@/lib/APIS';
  export default {
     name: 'input-components',
     props:['compaigns','WkPresets','jobTypes','curStatusDts','frmDataSubmit','compaignIdChanged','Module','Grade'],
    components: {
      VueTagsInput,
    },data:()=>({
      isLoading: true,
      status: '',
      tags: [],
      workflowPreset: '',
      frm: {compaignId:'', workflowPreset:'', currentStatus1:"",currentStatus: [], jobType: '', startDate:'', endDate:'' },
      autocompleteItems : APIS.getCurrentStatus(),
      autoworkflowPreset :APIS.getworkflowPreset,
      validation: [{
        classes: 'min-length',
        rule: tag => tag.text.length < 6,
      }, {
        classes: 'no-numbers',
        rule: /^([^0-9]*)$/,
      }, {
        classes: 'avoid-item',
        rule: /^(?!Cannot).*$/,
        disableAdd: true,
      }, {
        classes: 'no-braces',
        rule: ({ text }) => text.indexOf('{') !== -1 || text.indexOf('}') !== -1,
      }],
    }),
    methods:{
       frmDataSubmited(){
         this.isLoading=true;
          this.frmDataSubmit(this.frm, this.tags);
      },compaignIdChange(){
        this.compaignIdChanged(this.frm.compaignId);
      }
    }
     
     
  }
</script>
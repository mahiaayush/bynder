<template>
<form @submit.prevent="frmDataSubmited">
  <div>
    <div class="row">
	  <div class="col-sm-12 mb-2"><h4 class="H2-L1">Bynder Executive Reporting - Job View</h4></div>
    <div class="col-12">
      <div class="card rounded-0">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-md-9"><div class="font-weight-bold">
              <h6><i class="fa fa-filter" aria-hidden="true"></i> Filter</h6></div></div>
            <div class="col-md-3">
              <div class="input-group">
                <input type="text" class="form-control" @keydown.enter.prevent="jobkey_btn" v-model="frm.job_key" placeholder="Job Key (eg. SCI-1164)" aria-label="" aria-describedby="basic-addon1">
                <div class="input-group-append">
                  <button class="btn btn-secondary btn-sm" @click.prevent="jobkey_btn()" type="button">Search</button>
                </div>
              </div>
              <i v-if="keyfound ==false" style="font-size:12px; color:red"> Job key does't exist.</i>
            </div>
          </div>
           <div class="border-bottom pb-2">
            <!-- <div class="font-weight-bold">
              <h6><i class="fa fa-filter" aria-hidden="true"></i> Filter</h6>
              
            </div> -->
          </div>
          <div class=" row mt-3">
            <div class="col-md-3">
              <div class="form-group">
                <label for="formGroupExampleInput2">Workflow Preset<sup v-if="frm.workflowPresetError" class="text-danger">*</sup></label>
                <select v-model="frm.workflowPreset" :class="{ error : frm.workflowPresetError == true }"
                 class=" form-control" id="formGroupExampleInput2" @change="workflowPresetChange">
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
                <label for="formGroupExampleInput2">Permission Job Type<sup v-if="frm.jobTypesError" class="text-danger">*</sup></label>
                 <select  :class="{ error : frm.jobTypesError == true }" v-model="frm.jobType" class="form-control" id="jobstage"
                 @change="changeJobType"
                 :disabled="!checkJobType">
                  <option :selected="{selected:checkJobType}" value="">None Selected</option>
                  <option v-for=" jobType in jobTypes" :value="jobType.ID">
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
                  <option  v-for="Mdl in Module" :value="Mdl.ID" v-if="Mdl.label!=''">
                  {{Mdl.label}}</option>
                </select>
              </div>
            </div>
          <div class="col-md-3">
              <div class="form-group">
                <label for="jobstartDate">Job Date Started</label>
                <input  v-model="frm.startDate" type="text" class="daterange form-control" id="jobstartDate" autocomplete="off">
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label for="jobEndDate">Job Date Completed</label>
                <input v-model="frm.endDate" type="text" class="daterange form-control" id="jobEndDate" autocomplete="off">
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
      <button class="btn btn-primary rounded-0 btn-dark btn-sm mr-1" @click="frm.loadpage=1" type="submit">Search</button>
       <button type="button" @click.prevent="cancel_btn()" class="btn btn-sm btn-secondary rounded-0" role="button">Cancel</button>
    </div></div>
  </div>
</form>
</template>
<script>
  //import VueButtonSpinner from 'vue-button-spinner';
  import VueTagsInput from '@johmun/vue-tags-input';
  import APIS from '@/lib/APIS';
  export default {
     name: 'input-components',
     props:['compaigns','WkPresets','jobTypes','curStatusDts','frmDataSubmit','compaignIdChanged','Module','Grade','searchBykey'],
    components: {
      VueTagsInput,
    },data:()=>({
      isLoading: true,
      checkJobType:false,
      status: '',
      tags: [],
      workflowPreset: '',
      keyfound:true,
      frm: {job_key:'', compaignId:'', workflowPreset:'', workflowPresetError:false, jobTypesError:false, currentStatus1:"",currentStatus: [], jobType: '', startDate:'', endDate:'' },
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
    }),mounted: function() {
    var classes="";
    jQuery('.daterange').daterangepicker({
        autoUpdateInput: false,
        locale: { cancelLabel: 'Clear', format: 'YYYY-MM-DD' },
      });
    $('.daterange').on('apply.daterangepicker', function(ev, picker) {
      $(this).val(picker.startDate.format('YYYY-MM-DD') + ' - ' + picker.endDate.format('YYYY-MM-DD'));
      var id=$(this).attr("id");
      $(".daterange").each(function(){
         if($(this).attr('id')!=id){
           $(this).attr("disabled",true);
           $(this).val('');
         }
       });
      });
      $('.daterange').on('cancel.daterangepicker', function(ev, picker) {
          $(this).val('');
          jQuery(".daterange").each(function(){
              $(this).removeAttr("disabled");
          });
      });
  },
    methods:{
        onEnter(){
          alert(111)
        },
       setEndDate(d){
         this.frm.endDate=d;
       }, setStartDate(d){
         this.frm.startDate=d;
       },
       frmDataSubmited(){
          if(this.frm.workflowPreset==""){
            this.frm.workflowPresetError=true;
          }else if(this.frm.workflowPreset=='Permission' && this.frm.jobType==""){
            this.frm.jobTypesError=true;
          }else{
            if(this.frm.workflowPreset!="Permission"){
              this.frm.jobType="";
              this.checkJobType=false;
            }
            this.frm.startDate=$("#jobstartDate").val();
            this.frm.endDate=$("#jobEndDate").val();
            this.isLoading=true;
            console.log(this.frm.startDate);
            this.frmDataSubmit(this.frm, this.tags);
          }
      },workflowPresetChange(){
       if(this.frm.workflowPreset!=""){
          this.frm.workflowPresetError=false;
        } if(this.frm.workflowPreset!="Permission"){
          this.frm.jobTypesError=false;
          this.frm.jobType="";
          this.checkJobType=false;
        }else if(this.frm.workflowPreset=="Permission"){
          this.checkJobType=true;
        }
      },changeJobType(){
        if(this.frm.jobType!="")
        this.frm.jobTypesError=false;
      },compaignIdChange(){
        //this.compaignIdChanged(this.frm.compaignId);
      },cancel_btn(){
        this.frm={compaignId:'', workflowPreset:'',workflowPresetError:false, jobTypesError:false, currentStatus1:"",currentStatus: [], jobType: '', startDate:'', endDate:'' };
        this.tags=[];
        $("#jobstartDate").removeAttr("disabled");
        $("#jobEndDate").removeAttr("disabled");
        this.checkJobType=true;
        //this.frmDataSubmit(this.frm, this.tags);
       // window.location.reload();
      },
      async jobkey_btn(){
        var data=await this.searchBykey(this.frm.job_key);
        console.log("data== >",data);
        debugger
        if(data.hasOwnProperty('workflowPreset')){
          this.frm.workflowPreset=data.workflowPreset;
          if(data.workflowPreset=="Permission" && data.hasOwnProperty('jobType') && data.jobType!=""){
            if(data.jobType!="Unallocated"){
              this.frm.jobType=data.jobType.decode();
              this.checkJobType=true;
            }else{
              this.frm.jobType=data.jobType;
              this.checkJobType=true;
            }
            this.frm.workflowPresetError=false;
            this.frm.jobTypesError=false;
           }else{
              this.checkJobType=false;
              this.frm.jobType="";
          }
          this.keyfound=true;
        }else{
          this.keyfound=false;
        }
      }
    }
     
     
  }
</script>
<style lang="css" scoped>
.error{
  border: 1px solid red !important;
  color: red;
  position: relative;
} 
sup{ font-size: 16px;
    vertical-align: -webkit-baseline-middle;
}
.datepicker { right: 0 !important;}
</style>
<style lang="css">
.datepicker__input {
    font-size: 13px!important;
}
</style>
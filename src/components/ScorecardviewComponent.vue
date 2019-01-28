<template>
<div>
  <form @submit.prevent="frmScoreCardDate">
  <div class="">
   <div class="col-sm-12 mb-2"><h4>Bynder Executive Reporting - Score Card View</h4> </div>
 <div class="card rounded-0">
        <div class="card-body">
          <div class="border-bottom pb-2">
            <div class="font-weight-bold">
              <h6><i class="fa fa-filter" aria-hidden="true"></i> Filter</h6>
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-md-2">
              <div class="form-group">
               <label for="formGroupExampleInput2">Workflow Preset</label>
                <select v-model="frm.workflowPreset" class="form-control" id="formGroupExampleInput2">
                  <option value="">Please Select</option>
                  <option v-if="WkPresets.length==0">Loading..</option>
                  <option v-for="WkPreset in WkPresets" :value="WkPreset.text"> {{WkPreset.text}}</option>   
                </select>
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group">
                <label for="formGroupExampleInput2">Campaigns</label>
                <select v-model="frm.compaignId" @change="compaignIdChange()" class="form-control" id="exampleFormControlSelect1">
                  <option value="">Please Select</option>
                  <option  v-if="compaigns==''" >Loading ..</option>
                  <option 
                    v-for="compaign in compaigns"
                    :value="compaign.ID" >{{compaign.name}}</option>
                </select>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group">
                <label for="formGroupExampleInput2">Current Status</label>
                <div class="prices">
                    <vue-tags-input placeholder="Current Status" 
                    v-model="frm.currentStatus1"
                    :tags="tags"
                    @tags-changed="newTags => tags = newTags"
                    :validation="validation"
                    :autocomplete-items="autocompleteItems"/>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group">
                <label for="formGroupExampleInput2">Permission Job Type</label>
                <select v-model="frm.jobType" class="form-control" id="jobstage">
                  <option value="">None Selected</option>
                  <option value="" v-if="jobTypes.length==0" >Loading ..</option>
                  <option 
                  v-for="jobType in jobTypes" 
                  :value="jobType.ID">{{jobType.label}}</option>
                </select>
              </div>
            </div>
          </div>
          <div class=" row mt-3">
            <div class="col-md-2">
              <div class="form-group">
                <label for="jobstartDate">Job Date Started</label>
                <input v-model="frm.startDate" type="date" class="form-control" id="jobstartDate">
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group">
                <label for="jobEndDate">Job Date Completed</label>
                <input v-model="frm.endDate" type="date" class="form-control" id="jobEndDate">
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    <div class="col-12 text-right mt-2">
     <button class="btn btn-primary rounded-0" href="#" type="submit">Search</button>
     <a class="btn btn-secondary rounded-0" href="#" role="button">Cancel</a>
    </div>
    </form>
   <div class="mt-3 col-12">
      <div class="card rounded-0">
        <div class="card-body">
          <div class="row">
            <div class="col-md-6 mb-2">
            	    <div  class="w-100 border p-2">
                   <GChart
                      type="ColumnChart"
                      :data="chartData"
                      :options="chartOptions"></GChart>
                  </div>
            </div>
            <div class="col-md-6 mb-2">
            	   <div  class=" w-100 border p-2 ">
                   <!-- <GChart
                      type="ColumnChart"
                      :data="chartData"
                      :options="chartOptions"
                      ></GChart>   -->
                      <!-- :events="chartEvents" -->
                 </div>
            </div>
            <div class="col-md-6 mb-2">
            	 <div  class=" w-100 border p-2 ">
                 <div id = "container2" class="chart-box"></div>
              </div>
            </div>
            <div class="col-md-6 mb-2">
    	         <div  class=" w-100 border p-3 ">
                 <div id = "container4" class="chart-box ">  </div>
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>
    </div>
</template>
<script>
import APIS from '@/lib/APIS';
import VueTagsInput from '@johmun/vue-tags-input';
import { GChart } from 'vue-google-charts';
 export default {
    components: {
      GChart,
      VueTagsInput
    },
    data () {
    return {
      frm:[],
      WkPresets:[],
      compaigns:[],
      jobTypes:[],
      tags: [],
      workflowPreset: '',
      autocompleteItems : [],//APIS.getCurrentStatus(),
      autoworkflowPreset : [], //APIS.getworkflowPreset,
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

      chartData : [
        ['Jobs Name', 'In Progress', 'Hold', 'Completed'],
        ['', 0, 0, 0],
        
      ],
      chartOptions : {
        chart: {
          title: 'Company Performance',
          subtitle: 'Sales, Expenses, and Profit: 2014-2017',
        },
        bars: 'vertical',
        vAxis: {format: 'decimal'},
        isStacked: true,
       // height: 400,
        colors: ['#1b9e77', '#d95f02', '#7570b3']
      }
    }
    },
    created(){
      this.autocompleteItems =APIS.getCurrentStatus();
      this.autoworkflowPreset  =APIS.getworkflowPreset;
      this.WkPresets=APIS.getPrestsGroup();
      //this.jobTypes=jobtypes.options
    },
    async mounted() {
      this.compaigns= await APIS.getAllCompangns();
      const jobtypes = await APIS.getJobType();
    },
    methods:{
     async frmScoreCardDate() {
       
       let score1=await APIS.getScoreCardData(this.frm);
       let data= [ ['Jobs Name', 'In Progress', 'Hold', 'Completed'],
                  ]; //['jobId ', 1, 2,3]

       let isDump=[];
       console.log(score1);
       score1.forEach(function(dt, index){
         if(isDump.indexOf(score1[index]._id.campaignID) < 0){
           isDump.push(score1[index]._id.campaignID);
          }
       });
        //score1.filter()
        for (var i=0; i< isDump.length; i++){
          var data1=[isDump[i]];
          for(var k=0; k< score1.length; k++){
             if(score1[k]._id.campaignID==isDump[i]){
               if(score1[k]._id.status=="NeedsChanges"){
                 data1[2]=score1[k].count;
               }
               else if(score1[k]._id.status=="Approved"){
                 data1[3]=score1[k].count;
               }else if(score1[k]._id.status=="Active"){
                 data1[1]=score1[k].count;
               }
             }
          }
          data.push(data1);
        }
       console.log("calculated data is: ",data);
       this.chartData=data;
     }
   }
  }
</script>
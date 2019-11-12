<template>
<div>
  <form @submit.prevent="checkValidation">
  <div class="">
   <div class="col-sm-12 mb-2"><h4 class="H2-L1">Bynder Executive Reporting - Score Card View</h4> </div>
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
               <label for="formGroupExampleInput2">Workflow Preset <sup v-if="frm.workflowPresetError" class="text-danger">*</sup></label>
                <select v-model="frm.workflowPreset" :class="{ error : frm.workflowPresetError == true }" class="form-control " id="formGroupExampleInput2"
                @change="chkData">
                  <option value="">Please Select</option>
                  <option v-if="WkPresets.length==0">Loading..</option>
                  <option v-for="WkPreset in WkPresets" :value="WkPreset.text"> {{WkPreset.text}}</option>   
                </select>
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group">
                <label for="formGroupExampleInput2">Campaigns</label>
                <select v-model="frm.compaignId" class="form-control" id="exampleFormControlSelect1">
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
                <label for="formGroupExampleInput2">Permission Job Type <sup v-if="checkJobType && validte">*</sup></label>
                <select v-model="frm.jobType" :class="{error:checkJobType && validte}" class="form-control" id="jobstage"
                @change="jobTypeChanged" 
                :disabled="!checkJobType">
                  <option :selected="{selected:checkJobType}" value="">None Selected</option>
                  <option value="" v-if="jobTypes.length==0" >Loading ..</option>
                  <option 
                  v-for="jobType in jobTypes" 
                  :value="jobType.ID">{{jobType.label}}</option>
                </select>
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group">
                <label for="frmGrade">Grade</label>
                 <select v-model="frm.grade" class="form-control" id="frmGrade">
                  <option value="">None Selected</option>
                  <option 
                  v-for="Grd in Grade" :value="Grd.ID">
                  {{Grd.label}}</option>
                </select>
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group">
                <label for="frmModule">Module</label>
                 <select v-model="frm.modules" class="form-control" id="frmModule">
                  <option value="">None Selected</option>
                  <option  v-for="Mdl in Module" :value="Mdl.ID" v-if="Mdl.label!=''">
                  {{Mdl.label}}</option>
                </select>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group">
                <label for="jobstartDate">Job Date Started</label>
                <!-- <HotelDatePicker 
                id="travelDates"
                name="travelDates"
                v-model="frm.startDateRange"
                :startDate="new Date('2018-01-01')"
                format="YYYY-MM-DD"  
                :i18n="StartdateRange"
                :value="date"
                @checkInChanged="startDateRangeIn"
                @checkOutChanged="startDateRangeOut"
                ></HotelDatePicker> -->
                <date-range-picker v-model="frm.startDate" :value="StartDateValue"
                :dateId="dateId1"
                @update="update_StartDate" :disabled="Start_disabled"></date-range-picker>
                <!-- <input v-model="frm.startDate" type="date" class="form-control" id="jobstartDate"> -->
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group">
                <label for="jobEndDate">Job Date Completed</label>
                <date-range-picker 
                v-model="frm.endDate"
                @update="update_endDate"
                :disabled="End_disabled"
                :value="EndDateValue"
                :dateId="dateId2"
                ></date-range-picker>
              </div>
            </div>
            </div>
        </div>
      </div>
      </div>
    <div class="col-12 text-right mt-2">
     <button class="btn btn-dark btn-sm rounded-0 mr-1" href="#" type="submit">Search</button>
     <!-- <a class="btn btn-secondary  btn-sm rounded-0" href="#" @click.prevent="cancle_data" role="button">Reset</a> -->
      <button type="reset" class="btn btn-secondary  btn-sm rounded-0" role="button" @click="cancle_data">Reset</button>
    </div>
    </form>
    <div class="col-12  mt-2">
      <label v-if="ActiveLavel">Active Jobs</label>
      </div>
   <div class="col-12">
      <div v-if="isloading" class=" page-loading">
          <img src="ajax-loader.gif" class="loader">
      </div>
      <div class="card rounded-0">
        <div class="card-body">
          <div class="row">
              <div class="col-4">
              <table class="table table-striped table-bordered">
                <tbody>
                  <tr>
                      <td>NUMBER OF JOBS</td>
                      <td>{{ScoreCard.totalJobs}}</td>
                    </tr>
                    <tr>
                      <td>EXPECTED TURN AROUND TIME</td>
                      <td>{{ScoreCard.Exptat}} Days</td>
                    </tr>
                    <tr>
                      <td>MEDIAN DURATION</td>
                      <td>{{ScoreCard.MedianDur}} Days</td>
                    </tr>
                    <tr>
                      <td>NUMBER OF OVERDUE</td>
                      <td><a href="#" @click.prevent="openModalDuration(overDueIds)">{{ScoreCard.NumOver}}</a></td>
                    </tr>
                    <tr>
                      <td>NUMBER ON HOLD</td>
                      <td>{{ScoreCard.NumHold}} </td>
                    </tr>
                  </tbody>
                </table>
                </div>
            <div class="col-md-8 mb-2">
            	    <div  class="w-100 border p-2">
                    <div class="loading-box">
                    </div>
                   <GChart
                      type="LineChart"
                      :data="WeeklyJobsCData"
                      :options="WeeklyJobsCOptions"></GChart>
                  </div>
            </div>
            <!-- <div class="col-md-6 mb-2">
            	    <div  class="w-100 border p-2">
                    <div class="loading-box" v-show="MedianTeamLoad">
                    <img src="loading.gif" class="loader">
                    </div>
                   <GChart
                      type="ColumnChart"
                      :data="MedianTeamData"
                      :options="MedianTeamOptions"></GChart>
                  </div>
            </div> -->
            <div class="col-md-12 mb-2">
            	    <div  class="w-100 border p-2">
                    <div class="loading-box">
                    </div>
                   <GChart
                      type="ColumnChart"
                      :data="MedianTeamOvrData"
                      :options="MedianTeamOveOptions"></GChart>
                  </div>
            </div>
            <div class="col-md-12 mb-2">
            	    <div  class="w-100 border p-2">
                    <div class="loading-box">
                    </div>
                   <GChart
                      type="ColumnChart"
                      :data="Percentile90Data"
                      :options="Percentile90Options"></GChart>
                  </div>
            </div>
            <div class="col-md-6 mb-2">
            	    <div  class="w-100 border p-2">
                    <div class="loading-box">
                    </div>
                   <GChart
                      type="BarChart"
                      :data="totalJobsData"
                      :options="totalJobsOptions"></GChart>
                  </div>
            </div>
            <div class="col-md-6 mb-2">
            	   <div  class=" w-100 border p-2 ">
                   <div class="loading-box">
                    </div>
                   <GChart
                      type="ColumnChart"
                      :data="totalHoldJobData"
                      :options="totalHoldJobOptions"></GChart>  
                      <!-- :events="chartEvents" -->
                 </div>
            </div>
            <!-- <div class="col-md-12 mb-2">
            	 <div  class=" w-100 border p-2 ">
                <div class="loading-box">
                  <img src="loading.gif" class="loader">
                </div>
                <GChart
                      type="ColumnChart"
                      :data="averageDurationData"
                      :options="averageDurationOptions"></GChart>  
              </div>
            </div> -->
          
           </div>
         </div>
       </div>
     </div>
      <ScoreCardGridComponents></ScoreCardGridComponents>
    </div>
</template>
<script>
import APIS from '@/lib/APIS';
import VueTagsInput from '@johmun/vue-tags-input';
import { GChart } from 'vue-google-charts';
//import HotelDatePicker from 'vue-hotel-datepicker';
import ScoreCardGridComponents from '@/components/scoreCardGridComponents.vue';
import DateRangePicker from '@/components/dateRangePicker.vue';
//import { RotateSquare2 } from 'vue-loading-spinner';
 export default {
    components: {
      GChart,
      VueTagsInput,
   //   RotateSquare2
      //HotelDatePicker,
      DateRangePicker,
      ScoreCardGridComponents
    },
    data () {
    return {
      Start_disabled:false,
      End_disabled:false,ActiveLavel:true, isloading:true,
      dateId1:'datePicker1',dateId2:'datePicker2' ,
      StartdateRange:{
        night: 'Noite',
        nights: 'Noites',
        'day-names': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        'check-in': 'From',
        'check-out': 'To',
        'month-names': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      },
      StartDateValue:'',EndDateValue:'',
      Grade:[],
      loading:true,
      Module:[],
      frm:{workflowPreset:'',workflowPresetError:false, compaignId:'', jobType:'', grade:'', modules:'', 
      startDate:'', endDate:'',startDateRange:'', endDateRange:'', currentStatus:[] },
      checkJobType:false, validte:true,
      WkPresets:[],
      compaigns:[],
      jobTypes:[],
      tags: [],
      overDueIds:[],
      workflowPreset: '',
      autocompleteItems : APIS.getCurrentStatus(),
      autoworkflowPreset : [], //APIS.getworkflowPreset,
      ScoreCard:{ totalJobs:"N/A", Exptat:"N/A", MedianDur:"N/A", NumOver:'N/A', NumHold:"N/A"},
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
      WeeklyJobsCData:[['Weeks', 'Created Jobs','Completed Jobs'],
                      // ['1 jan -7 jan', 5, 2],
                      // ['8 jan -15 jan', 25, 11],
                      // ['16 jan -23 jan', 15, 20],
                      ],
      WeeklyJobsCOptions:{title: 'Number of Jobs Created and Completed By Week ',
			titleTextStyle: { color: '#07212d', fontName: 'Karla', fontSize: '14' },
			fontSize:10, height: 400, width:700, animation:{ duration: 1000, easing: 'out', },
      legend: { position: 'bottom' }, colors: ["#07212D","#FF5B34"] },
      MedianTeamLoad:true,
      MedianTeamOvrData :[['Duration Days','Clip Art&Storage Team','Content Team','On Hold Team','Permissions Team','Shutterstock Team']
        // ['Permission', 10, 12,4,0,55],
        // ['Permission1',  12,4,0,55,10,],
        // ['Permission2', 10, 12,0,4,55],
        // ['Permission3', 10, 12,4,0,55]
      ],
      MedianTeamOveOptions:{ title: 'Median Time Per Team (In Days)', titleTextStyle: { color: '#07212d', fontName: 'Karla', fontSize: '14' },
		    fontSize:10, chart: { title: 'Company Performance'}, bars: 'vertical', vAxis: {format: 'decimal'}, isStacked: true,
        height: 400,  legend: { position: 'bottom' },//colors: ["#7DBA51","#136353"]
        colors: ["#27b0f0","#7030a0","#009","#ffff01","#d1b914","#92d04f"]
      },
      Percentile90Data:[ ['Duration Days','Clip Art&Storage Team','Content Team','On Hold Team','Permissions Team','Shutterstock Team'] 
      ['Permission', 10, 12,4,0,55],
        ['Permission1',  12,4,0,55,10,],
        ['Permission2', 10, 12,0,4,55],
        ['Permission3', 10, 12,4,0,55]
      ],
      Percentile90Options:{
         title: '10th & 90th Percentile (In Days)', titleTextStyle: { color: '#07212d', fontName: 'Karla', fontSize: '14' },
		     fontSize:10, chart: { title: 'Company Performance'}, bars: 'vertical', vAxis: {format: 'decimal'}, //isStacked: true,
         height: 400,  legend: { position: 'bottom' },  colors: ["#27b0f0","#7030a0","#009","#ffff01","#d1b914","#92d04f"]
      },
      totalJobsData:[['Jobs Name', 'In Progress', 'Hold', 'Completed'],
        //['-', 0, 0, 0],
      ],
      totalJobsOptions :{
        title: 'Total Jobs', titleTextStyle: { color: '#07212d', fontName: 'Karla', fontSize: '14' },
		    fontSize:10, chart: { title: 'Total Jobs'}, bars: 'vertical', vAxis: {format: 'decimal'},
        height: 400, legend: { position: 'bottom' }, colors: ['#7DBA51', '#FF5B34', '#07212D']
      },
      totalHoldJobData: [
        ['Jobs Name',  'Hold'],
        // ['t1-', 3 ],
        // ['tw-', 1 ],
        // ['tq1-', 7 ],
        // ['tws1-', 8],
      ],
      totalHoldJobOptions : {
        title: 'Jobs On Hold', titleTextStyle: { color: '#07212d', fontName: 'Karla', fontSize: '14' },
		    fontSize:10, chart: { title: 'Company Performance'},
        bars: 'vertical', vAxis: {format: 'decimal'}, isStacked: true,
        height: 400,  legend: { position: 'bottom' }, colors: ['#FF5B34']
      },
      averageDurationData :[['Jobs Name', 'Average Duration'],
                // ['t1', 15, 7],
                // ['t2', 20, 7],
                // ['t1', 13, 8],
                // ['t1', 18, 7],
              ],
      averageDurationOptions: {
        title: 'Average Job Duration',
        chart: {  subtitle: 'Sales, Expenses, and Profit: 2014-2017'},
        bars: 'vertical', vAxis: {format: 'decimal'}, isStacked: true,
        height: 400, colors: ['#d95f02', '#7570b3' ], legend: { position: 'bottom' }
      }
    }
    },
    created(){
      this.autocompleteItems =APIS.getCurrentStatus();
      this.autoworkflowPreset  =APIS.getPrestsGroup();
      this.WkPresets=APIS.getPrestsGroup();
    },
    async mounted() {
      this.$route.params.jobid,
      this.compaigns= await APIS.getAllCompangns();
      const jobtypes = await APIS.getJobType();
      this.jobTypes=jobtypes[0].options;
      if(this.jobTypes.length>0){
        this.jobTypes.push({ID:'Unallocated', label:'Unallocated'})
      }
      var dtgrade  =await APIS.getGrade();
      this.Grade =dtgrade[0].options;
      var dtmodule=await APIS.getModule();
      this.Module=dtmodule[0].options;

      await this.frmScoreCardDate();
    },
    methods:{
      cancle_data(){
        this.Start_disabled=false;
        this.End_disabled=false;
        $("#datePicker1").removeAttr("disabled");
        $("#datePicker2").removeAttr("disabled")
      },
      update_endDate(value){
        debugger
        this.frm.endDateRange = value;
        this.Start_disabled=true;
     },update_StartDate(date) {
       debugger
        this.End_disabled=true;
        this.frm.startDateRange = date;
      },
      async openModalDuration(overDueIDs){
        var overDueJobs= await APIS.getOverDueJobs({overDueIDs:overDueIDs});
        this.$children[this.$children.length-1].items=overDueJobs;
        this.$modal.show('hello-world');
      },
      setFormate(d){
        var month, day,year;
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        return [year, month, day].join('-');
      },
     async checkValidation(){
      if(this.frm.workflowPreset==""){
         this.frm.workflowPresetError=true;
       }else if(this.frm.workflowPreset=="Permission" && this.frm.jobType==""){

       }else{
         try{
         this.frm.startDateRange=$("#datePicker1").val();
         this.frm.endDateRange=$("#datePicker2").val();
       }catch(e){console.log("Error is :",e);}
         this.frmScoreCardDate();
         this.ActiveLavel=false;
       }
      // this.frm.startDateRange= this.getstartDateRange(1);
       //this.frm.endDateRange= this.getstartDateRange(2);
     },chkData(){
       if(this.frm.workflowPreset=="Permission" ){
          this.checkJobType=true;
          this.frm.workflowPresetErrorLoadedData=false;
          //this.jobTypes=[];
        }else{
          this.frm.jobType='';
          this.checkJobType=false;
          
        }
       if(this.frm.workflowPreset==""){
         this.frm.workflowPresetError=true;
       }else{
         this.frm.workflowPresetError=false;
       } 
     },jobTypeChanged(){
       if(this.frm.jobType!=""){
          this.validte=false;
       }else{
         this.validte=true;
       }
     },
     async frmScoreCardDate(){
       this.isloading=true;
       var a=[];
       var tags=this.tags;
        if(tags.length >0){
          for(let i=0; i<tags.length; i++){
            a.push(tags[i].text);
          }
        }
      this.frm.currentStatus=a;
      let score1=await APIS.getScoreCardData(this.frm);
      this.getLoadedData(this.frm);

      score1=score1.chartData1and2;
      let dataChart= [ ['Jobs Name',   'In Progress', 'Hold',  'Completed'],
                 // ['test1 ', 1, 2, 3],
                 // ['test3 ', 5, 8, 3],
                  ];
          let dataChart2= [
                ['Jobs Name',  'Hold']
              ];
          let dataChart3= [
                ['Jobs Name',  'Total Duration', 'Average Duration',''],
                // ['t1', 15, 7],
                // ['t2', 20, 7],
              ];
          var campaignIDS=[], totalFilterdJobs=0, totalFilterdJobsHold=0;
          for(var dt in  score1){
            if(score1[dt]._id.status!="Cancelled"){
              totalFilterdJobs= totalFilterdJobs+ score1[dt].count;
              if(score1[dt]._id.status=="NeedsChanges"){
                totalFilterdJobsHold=totalFilterdJobsHold+score1[dt].count;
              }
            }
            if(campaignIDS.indexOf(score1[dt]._id.campaignID)==-1 ){
              campaignIDS.push(score1[dt]._id.campaignID);
            }
          }
          for(var ddt in campaignIDS){
            var NeedsChanges=score1.filter( data=>data._id.status=='NeedsChanges' && data._id.campaignID==campaignIDS[ddt]);
            var Approved=score1.filter( data=>data._id.status=='Approved' && data._id.campaignID==campaignIDS[ddt]);
            var Active=score1.filter( data=>data._id.status=='Active' && data._id.campaignID==campaignIDS[ddt]);
            try{
             dataChart.push([
              score1.filter( data=>data._id.campaignID==campaignIDS[ddt])[0]._id.compName[0] , 
               (Active.length>0)?Active[0].count:0 , 
               (NeedsChanges.length>0)? NeedsChanges[0].count:0, 
               (Approved.length>0)? Approved[0].count:0 ] );
               dataChart2.push([
                 score1.filter( data=>data._id.campaignID==campaignIDS[ddt])[0]._id.compName[0] ,
                 (NeedsChanges.length>0)? NeedsChanges[0].count:0, 
               ]);
            }catch(Err){
              console.log(Err)
            }
          }
         this.ScoreCard.totalJobs=totalFilterdJobs;
         this.ScoreCard.NumHold=totalFilterdJobsHold;
         this.totalJobsData=dataChart;
         this.totalHoldJobData=dataChart2;
        //  this.ScoreCard.Exptat=TaTcountData[0].tat;
        //  this.ScoreCard.NumOver=overDueJobs;
     }, async getLoadedData(obj){
       // console.log("getLoadedData", obj);
       var data=  await APIS.getLoadedData(obj);
       var jobsStatus=data.jobsStatus;
       //var FinishedJobs=data.GraphCreatedJobs.FinishedJobs;

      var GraphCreatedJobs=await APIS.created_complated(this.frm);//.CreatedJobs;
      var MedianData=await APIS.medianoverdueperteam(this.frm);
      var tempData=await APIS.formedian(this.frm);
      var tempData2=new Array();
      for(let tempdt of tempData){
          var tmp2=tempdt.Preset_Stages.map(dt=> ({ 
            TeamName : responcibleTeam( ((dt.hasOwnProperty('name'))?dt.name: dt.StageNames) , tempdt.presetName, tempdt), 
            StageDuration :  parseFloat( dateDiffC(dt.start_date,  ((dt.hasOwnProperty('job_date_finished'))?dt.job_date_finished: new Date()) ) ),
            date:{start:dt.start_date, end:dt.job_date_finished},
            position : dt.position
            }));
          tempData2.push({Preset_Stages:tmp2, id:tempdt.id, presetName: tempdt.presetName}  );
      }
      debugger
      for(let l =0; l< tempData2.length; l++){
           tempData2[l].Preset_Stages= tempData2[l].Preset_Stages.reduce((m, d)=>{
                    if(!m[d.TeamName]){
                      m[d.TeamName] = {...d, count: 1};
                      return m;
                    }
                    m[d.TeamName].StageDuration += d.StageDuration ;
                    m[d.TeamName].count += 1;
                    return m;
                },{});
      }
      debugger
      var mediamOverDue=MedianData.OverDueData;
      mediamOverDue=mediamOverDue.map(data => ({
          teams: data.teams, 
          resteams:  responcibleTeam(data.currentStage, data.teams), 
          jobDuration: data.jobDuration,
          overDueIds: data.overDueIds,
          overDueCount:data.overDueCount
        }));

      // mediamOverDue=mediamOverDue.map(data => ({
      //     teams: data.teams, 
      //     resteams:  responcibleTeam(data.currentStage, data.teams), 
      //     jobDuration: data.jobDuration,
      //     overDueIds: data.overDueIds,
      //     overDueCount:data.overDueCount
      //   }));
      
      var permissionResponce=data.permissionResponce;
      permissionResponce=permissionResponce.map(d=>  d.data.map(dd=>({ jobDuration: dd.duration, CalDuration: dd.CalDuration, resteams:  responcibleTeam(dd.stageName, d.permission), teams:d.permission ,  }) ));
      var permissionRes=[];
      for(let dd of permissionResponce){ permissionRes= permissionRes.concat(dd); }
      var MedianTeamOvrData=[['Duration Days','Clip Art&Storage Team','Content Team','On Hold Team','Permissions Team','Shutterstock Team']];
      var Percentile90Data=[['Duration Days','Clip Art&Storage Team','Content Team','On Hold Team','Permissions Team','Shutterstock Team']];
      var medData=[];
      var Groups=['Permission','Created Image','Shutterstock','Clip Art'];
      var Teams=['Clip Art & Storage Team','Content Team', 'On Hold Team','Permissions Team', 'Shutterstock Team'];
      debugger
        for( let grp of Groups ){
            let teamsGroupData=permissionRes.filter(data =>data.teams==grp /*&& data.resteams== team*/ );
            let teamsOVERData=mediamOverDue.filter(data =>data.teams==grp );
            var data=new Array( grp +" Median" );
            var percentileData10=new Array(grp+ " 10th percentile"),  percentileData90=new Array(grp +" 90th percentile");
            for(let team of Teams){
              var mediam=0, percentile10=0, percentile90=0, teamData= teamsGroupData.filter(data=> data.resteams== team);
              if(teamData.length >0){
                var jobDuration= teamData.map((a,i)=>a.jobDuration);
                mediam=getMedian2(jobDuration);
                percentile10=getPersentiles(jobDuration,10); 
                percentile90=getPersentiles(jobDuration,90);
              }
              data.push( mediam );
              percentileData10.push(percentile10);
              percentileData90.push(percentile90);
            }
            Percentile90Data.push(percentileData10);
            Percentile90Data.push(percentileData90);
            MedianTeamOvrData.push(data);
            var dt2=new Array( grp +" Overdue");
            for(let team of Teams){
              var mediamOver=0, teamData= teamsOVERData.filter(data=> data.resteams== team);
              if(teamData.length >0){
                var dt= teamData.reduce((a, b)=>({ jobDuration: a.jobDuration.concat(b.jobDuration)}));
                mediamOver=getMedian2(dt.jobDuration);
              }
              dt2.push( mediamOver );
            }
            MedianTeamOvrData.push(dt2);
        }
      /*
      var permissionArray=permissionResponce.filter((data)=>data.team=="Permission");
      var CreatedImageArray=permissionResponce.filter((data)=>data.team=="Created Image");
      var ShutterStockArray=permissionResponce.filter((data)=>data.team=="Shutterstock");
      var ClipArtArray=permissionResponce.filter((data)=>data.team=="Clip Art");
      // devide Team Wise Data Code //
      
      var permissionData=mediamOverDue.filter((data)=>data.teams=="Permission");
      var PermissionTeam1=permissionData.filter( dt => dt.resteams=='Art Team');
      var duration1=[];
      if(PermissionTeam1.length > 0){
        var red= PermissionTeam1.reduce((a, b)=>({ jobDuration: a.jobDuration.concat(b.jobDuration)})); 
        duration1=red.jobDuration;
        
      }
     

      var TotalPermissionJobDuration=[];
      if(permissionData.length >0 ){ 
        var reduce=permissionData.reduce( (a, b) => ({jobDuration : a.jobDuration.concat(b.jobDuration)  })); 
        TotalPermissionJobDuration= reduce.jobDuration;
      }
      */
      var GTat=MedianData.GTat;
      //let overDueJobs=0;
      let overDueJobs=0, overDueIds=[], perCount=0,perArray=[], allIDs=[];
      if(mediamOverDue.length >0){
        overDueJobs=mediamOverDue.reduce((a, b)=> a+ b.overDueCount,0);
        allIDs=mediamOverDue.reduce( (a, b) => ({overDueIds : a.overDueIds.concat(b.overDueIds)  })); 
        overDueIds=allIDs.overDueIds;
      }
      
      var MonthName=["Jan","Feb","Mar","Apr","May","Jun", "Jul","Aug","Sep","Oct", "Nov","Dec"];
      this.WeeklyJobsCData=[['Weeks', 'Created Jobs','Completed Jobs']];
      // weekly data set formate 
      // GraphCreatedJobs.FinishedData
      // GraphCreatedJobs.CreatedData
      // GraphCreatedJobs.EndTime
      // GraphCreatedJobs.StartTime
      var startDate=new Date(GraphCreatedJobs.StartTime);
      var endDate= new Date(GraphCreatedJobs.EndTime);
      var dataFormate=[];
      while(endDate.getTime() >= startDate.getTime()){
        var startWeek=new Date(MpsDateFormat(startDate));
        startDate.setDate(startDate.getDate() + 6);
        var dateFormate=MpsDateFormat(startDate);
        var CreatedJobs=0, ComplatedJobs=0;
        var dateRange=  startWeek.getDate()+"-"+Month(startWeek) +" To "+ startDate.getDate()+"-"+Month(startDate) ;
        var result1=GraphCreatedJobs.CreatedData, result2=GraphCreatedJobs.FinishedData;
        for(let temp in result1){
          var dbDate=new Date( MpsDateFormat(result1[temp]._id)).getTime();
          if(result1[temp].hasOwnProperty("_id") &&  dbDate >= startWeek.getTime() &&  dbDate <= startDate.getTime() ){
            CreatedJobs=CreatedJobs+ result1[temp].count;
          }
        }
        for(let temp in result2){
          var dbDate=new Date(result2[temp]._id).getTime();
          if(result2[temp].hasOwnProperty("_id")  &&  dbDate > startWeek.getTime() &&  dbDate  <= startDate.getTime()  ){
            ComplatedJobs=ComplatedJobs+ result2[temp].count;
          }
        }
        dataFormate.push({dateRange: dateRange, Created:CreatedJobs, FinshedJobs : ComplatedJobs} );
        startDate.setDate(startDate.getDate() + 1);
      }
      for(let i in dataFormate){
         this.WeeklyJobsCData.push([ dataFormate[i].dateRange, dataFormate[i].Created , dataFormate[i].FinshedJobs ]);
      }
      this.isloading=false;

      /// Status wise jobs set on graph
      var holdJobs=0, totalJobs=0;
       for( let k in jobsStatus){
          if(jobsStatus[k]._id.status=="NeedsChanges"){
            holdJobs=holdJobs+jobsStatus[k].count;
          }
          if(jobsStatus[k]._id.status!="Cancelled" && jobsStatus[k]._id.status!="Idle"){
            totalJobs=totalJobs+jobsStatus[k].count;
          }
       }
      var sortable_all=[];
      var sortable = [];
      var allPermissionJobDuration=0, allCreatedJobDuration=0, allShutterstockJobDuration=0,
      allClipArtJobDuration=0;
      // var MedianTeamData=[ ['Duration Days', 'Median Duration' ]];
      // var Percentile90Data=[['Duration Days', '10th Percentile' ,'90th Percentile' ]];
      // var averageDurationData=[[ 'Duration Days', 'Average Duration' ]];
      // if(permissionArray.length>0){
      //     var permission =permissionArray[0].data;
      //     for (var keys in permission) {
      //         allPermissionJobDuration=allPermissionJobDuration+ permission[keys].duration;
      //         sortable.push([ permission[keys].id , permission[keys].duration]);
      //         sortable_all.push([ permission[keys].id , permission[keys].duration]);
      //     }
      //     var percentile10 =getPercentile(sortable, 10);
      //     var percentile90 = getPercentile(sortable, 90);
      //     Percentile90Data.push( [ 'Permissions Team', percentile10, percentile90]);
      // }
     
      var AllMedian= getMedian(sortable_all);
      this.overDueIds=overDueIds;
      debugger
      this.MedianTeamOvrData=MedianTeamOvrData;
      if(GTat!=0){
        this.ScoreCard.Exptat=GTat;
      }else{
        this.ScoreCard.Exptat="N/A";
      }
      this.ScoreCard.NumOver=overDueJobs;
      if(AllMedian){
         AllMedian=parseFloat(AllMedian).toFixed(1);
       }
      this.ScoreCard.MedianDur= AllMedian;
      this.MedianTeamLoad=false;
      this.Percentile90Data=Percentile90Data;
     // this.averageDurationData=averageDurationData;
     }
    }
  }
function getMedian2(arrays){
  arrays.sort(function(a, b) {  return a - b; });
  var data="";
  if(arrays.length < 2){
      if(arrays[0]!=null){
        data=arrays[0];
      }else{
        data=0;
      }  
    }else{
      if((arrays.length)%2!=0){
        var index = Math.round((arrays.length)/2,1);
        data = arrays[index-1];
      }
      else{
        var index = (arrays.length)/2;
        var index2 = index-1;
        data = (arrays[index]+arrays[index2])/2;
      }
    }
    if(data<0){
      data=data*-1;
    }
    return data||0;
}

  // external functions //
function getMedian(arrays){
   arrays.sort(function(a, b) {
          return a[1] - b[1];
      });
      var data="";
    console.log("getMedian", arrays);
    if(arrays.length < 2){
      if(arrays[0]!=null){
        data=arrays[0][1];
      }else{
        data=0;
      }  
    }else{
      if((arrays.length)%2!=0){
        var index = Math.round((arrays.length)/2,1);
        data = arrays[index-1][1];
      }
      else{
        var index = (arrays.length)/2;
        var index2 = index-1;
        data = (arrays[index][1]+arrays[index2][1])/2;
      }
    }
    if(data<0){
      data=data*-1;
    }
    return data||0;
}
function getPersentiles(arrays, value){
    var data=0,roundValue=0, nextVal = 0; 
    arrays= arrays.sort(function(a,b) { return a - b;});
    var rank=value*(arrays.length)/100;
    if( value*(arrays.length)%100==0 ){
      data=arrays[rank];
    }else {
      roundValue= Math.floor(rank,1 );
          if(roundValue<1){
            nextVal = roundValue+1;
          } else{
            nextVal = roundValue-1;
          }
          data = (arrays[roundValue]+arrays[nextVal])/2;
    }
    return data;
}
function getPercentile(arrays, percentileValue){
  debugger
      arrays.sort(function(a, b) {
          return a[1] - b[1];
      });
      console.log("getPercentile", arrays);
      var data=0;
      var roundValue=0;
      var nextVal = 0;
      var counts=arrays.length;
      if(arrays.length < 2){
      if(arrays[0]!=null){
        data=arrays[0][1];
      }else{
        data=0;
      } 
      }else{
        var tempResult =(counts * percentileValue) /100; 
        if((counts * percentileValue)%100 == 0){
          roundValue= Math.floor(tempResult,1 );
          data = (arrays[roundValue-1][1]);
        }
        else{
          roundValue= Math.floor(tempResult,1 );
          if(roundValue<1){
            nextVal = roundValue+1;
          }
          else{
            nextVal = roundValue-1;
          }
          data = (arrays[roundValue][1]+arrays[nextVal][1])/2;
        }
        
          // roundValue= Math.floor(tempResult,1 ); 
          // fractionValue = tempResult-roundValue;
          // var index =roundValue; 
          // var index2=0;
          // if(index>=arrays.length-1){
          //   index=arrays.length-1;
          //   index2=index-1;
          // }else{
          //   index2=(index+1); 
          // }
          // if(index>0){
          //   if(arrays[index-1][1]>arrays[index2-1][1]){
          //   data = ((arrays[index-1][1]-arrays[index2-1][1])*fractionValue)+roundValue;
          // }
          // else{
          //   data = ((arrays[index2-1][1]-arrays[index-1][1])*fractionValue)+roundValue;
          // }
          // }
          // else{
          //   data = ((arrays[index2-1][1])*fractionValue)+roundValue;
          // }
           
      }
    return data||0;
}
function dateDiffC(date1, date2){
      var d2, d1=new Date(date1);  
  if( typeof date2 === "undefined"|| date2 === null  ||date2==""){
    d2=new Date();
  }else{
    d2=new Date(date2);
  }
  var timeDiff = Math.abs(d2.getTime() - d1.getTime());
  return parseFloat(timeDiff/86400000).toFixed(1);
        // var dateFirst = new Date(date1);
        // var dateSecond = new Date(date2);
        // var timeDiff = Math.abs(dateSecond.getTime() - dateFirst.getTime());
        // return  Math.ceil(timeDiff / (1000  *3600*  24));
      }   
  function roundTo(n, digits) {
 		var negative = false;
    if (digits === undefined) {
        digits = 0;
    }
		if( n < 0) {
    	negative = true;
      n = n * -1;
    }
    var multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    n = (Math.round(n) / multiplicator).toFixed(2);
    if( negative ) {    
    	n = (n * -1).toFixed(2);
    }
    return n;
}
function getSum(total, num) {
  return total[1] + num[1];
}
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}
function Month(dd){
  var months    = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[dd.getMonth()];
}
function combineMediun(data){
  var TeamMedian=0;
  if(data.length>0){
    data=data[0].data;
    var sortable=[];
    for (var keys in data) {
      sortable.push([ data[keys].id , data[keys].duration]);
    }
    TeamMedian= getMedian(sortable);
  }
  return TeamMedian;
}
function MpsDateFormat(d) {
  if(typeof d =="string"){
    d=new Date(d);
  }
  let month, day, year;
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month, day].join('-');
}
function responcibleTeam(name, PresetName, id){
  var Teamname="";
  try{
 if(name!=""){
   if(name.toLowerCase().indexOf("research asset and original source")!=-1 ||
   name.toLowerCase().indexOf("select job type")!=-1 ||
   name.toLowerCase().indexOf("copyright status")!=-1 ||
   name.toLowerCase().indexOf("contract negotiation and asset procurement")!=-1 ||
   name.toLowerCase().indexOf("review image permissions")!=-1 ||
   name.toLowerCase().indexOf("asset approval")!=-1 ||
   name.toLowerCase().indexOf("a&p record keeping")!=-1 ){
     Teamname="Permissions Team";
   }else if(name.toLowerCase().indexOf("waiting room preflight")!=-1 && !!PresetName && PresetName.indexOf("Permission")!=-1){
     Teamname="Permissions Team";
   }
   else if(name.toLowerCase().indexOf("art production lead assigns designer")!=-1 ||
    name.toLowerCase().indexOf("create asset")!=-1 ||
    name.toLowerCase().indexOf("designer create asset")!=-1 ||
    name.toLowerCase().indexOf("review image design and quality")!=-1 ||
    name.toLowerCase().indexOf("art production lead review")!=-1 ||
    name.toLowerCase().indexOf("team lead/designer creates asset")!=-1 ||
    name.toLowerCase().indexOf("team lead assigns designer")!=-1 ||
    name.toLowerCase().indexOf("waiting room preflight")!=-1 ){
      Teamname="Art Team";
   }
   else if(name.toLowerCase().indexOf("search the dam for existing assets")!=-1 ||
   name.toLowerCase().indexOf("verify permissions and upload the")!=-1 ||
   name.toLowerCase().indexOf("evaluate asset and assign for further action ")!=-1 ||
   name.toLowerCase().indexOf("search the DAM for existing assets ")!=-1 ||
   name.toLowerCase().indexOf("waiting room preflight (for clip art or storage workflow) ")!=-1 ||
   name.toLowerCase().indexOf("approve and upoad asset to the waiting room")!=-1 ){
     Teamname="Clip Art & Storage Team";
   }else if(name.toLowerCase().indexOf("complete image research and provide options to writer")!=-1 ||
   name.toLowerCase().indexOf("upload final image")!=-1 ){
     Teamname="Shutterstock Team";
   }else if(name.toLowerCase().indexOf("content team feedback and approval")!=-1 ||
   name.toLowerCase().indexOf("feedback and approval")!=-1 ||
   name.toLowerCase().indexOf("math audit review")!=-1 ||
   name.toLowerCase().indexOf("math managing editor feedback and approval")!=-1 ||
   name.toLowerCase().indexOf("complete request form")!=-1 ||
   name.toLowerCase().indexOf("content team feedback and approval")!=-1 ||
   name.toLowerCase().indexOf("feedback and approval")!=-1 ||
   name.toLowerCase().indexOf("fpo math audit")!=-1 ||
   name.toLowerCase().indexOf("rejected asset notification")!=-1 ){
     Teamname="Content Team";
   }else{
     Teamname="On Hold Team";
   }
 }
  }catch(e){
    console.log("Error not found stage name",name, PresetName, id, e);
  }
 return Teamname;
}//getRandomColor
function getColorByName( name ) {
 var color="#ffff01";
 var colorData= new Array({color:"#ffff01", name:"Permissions Team"},{color:"#92d04f", name:"Art Team"},
 {color:"#d1b914",name:"Shutterstock Team"},{color:"#27b0f0", name: "Clip Art & Storage Team"},{color:"#7030a0", name:"Content Team"});
  for(let temp of colorData){
    if(temp.name==name){ color=temp.color; break; }
  }
  return color;
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

.page-loading{ position: absolute;
height: 100%;
width: 100%;
background:#000;
opacity:0.4;
z-index: 99;
}
.loader{
  top: 10%;
  position: absolute;
  width:15%;
  left:40%;
}
</style>
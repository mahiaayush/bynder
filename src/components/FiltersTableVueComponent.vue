<template>
  <div> 
    <div class="row">
    <div class="mt-3 col-12">
    <div class="card rounded-0">
    <div class="card-body pt-2">
    <div class="border-bottom pb-2">
            <div class="d-flex justify-content-between ">
              <div class="font-weight-bold d-flex mt-3">
                <small class="mr-2"> Search Result : <span v-show="results.length>0">Page <strong>{{currentPage}}</strong></span></small>
                <small> Rows:
                <select class=" sm" id="sel1">
                  <option>10</option>
                  <option>20</option>
                  <option>50</option>
                  <option>100</option>
                  <option>250</option>
                  <option>500</option>
                </select>
              </small>
              </div>
              <div class="chart-icon">
                <!-- <a href="#" class="px-1"><i class="fa fa-refresh" aria-hidden="true"></i></a>
                <a href="#" class="px-1"><i class="fa fa-arrows-alt" aria-hidden="true"></i></a> -->
                
                <!-- <a href="#" @click.prevent="clearTempDelete()" class="px-1">Clear Temporary Data<i class="fa fa-times" aria-hidden="true"></i></a>  -->
              <div class="btn-group">
                <b-dropdown id="ddown1" right size="sm" class="m-md-2">
                  <b-dropdown-item >
                  <download-excel :fetch="fetchData" :fields="json_fields" name="Bynder_exportsheet.xls"><i class="fa fa-file-excel-o"></i> Excel</download-excel>
                  </b-dropdown-item>
                  <!-- <b-dropdown-item><i class="fa fa-file-pdf-o"></i> PDF</b-dropdown-item> -->
                  <b-dropdown-item @click="delete_temp_data"><i class="fa fa-trash"></i> Delete</b-dropdown-item>
                  <b-dropdown-item @click="clearTempDelete"><i class="fa fa-times"></i> Clear Temporary Data</b-dropdown-item>
                </b-dropdown>
              </div>
<!-- <div class="btn-group">
  <button type="button" class="btn btn-secondary dropdown-toggle btn-sm" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
<i class="fa fa-cog" aria-hidden="true"></i>
  </button>
  <div class="dropdown-menu dropdown-menu-right p-0">
    <button class="dropdown-item" type="button"><i class="fa fa-file-excel-o"></i> Excel</button>
    <button class="dropdown-item" type="button"><i class="fa fa-file-pdf-o"></i> PDF</button>
     <button class="dropdown-item" type="button"><i class="fa fa-trash"></i> DEL</button>
  </div>
</div> -->
</div>
</div>
</div>
  <!-- <div v-if="results.length>0">
      Page : {{currentPage}} Display </div>
      <b-pagination align="right" :total-rows="100" v-model="currentPage" :per-page="10">
      </b-pagination>
    </div> -->




<div class="table-responsive" id="table_view">
    <table class="table table-bordered" >
     <thead class="thead-light text-nowrap">
      <tr>
        <th><input type="checkbox" v-model="chk_boxAll"></th>
        <th><a @click="sorting('joincollection3.name', asc_desc1)">Campaigns</a></th>
        <th>Preset</th>
        <th>Job Key</th>
        <th @click="sort('name')">Job Name</th>
        <th>Grade</th>
        <th>Module</th>
        <th>Lesson</th>
        <th>Component</th>
        <th>Current Status</th>
        <th title="Job Date Started">Job Started</th>
        <th title="Job Date Finished">Job Finished</th>
        <th>Job Duration</th>
        <th>Current Stage</th>
        <th>Current Stage Duration</th>
        <th>Stage Responsible Team</th>
        <th>Comment</th>
        <!--<th>Action</th>-->
      </tr>
    </thead>
    <tbody :class="cls">
      <tr v-for="(result, indd) in results">
       <td><input type="checkbox" v-model="chk_box" :id="'chk_box'+indd" :value="result.id">
       
       </td>
        <td>{{result.joincollection3[0].name}}</td>
        <td>
          <a class="jobId_selector" target="_blank"  :href="'https://greatminds.getbynder.com/workflow/job/view/'+ (result.id.split('-').join('')) "> 
          {{result.presetName}} </a>
        </td>
         <td>
          <a target="_blank" :href="'https://greatminds.getbynder.com/workflow/job/view/'+result.job_key">
          {{result.job_key}}
          </a>
        </td>
        <td :title="result.name">{{ result.name.substring(0, 25) }}
        </td>
         <td>
          <span v-for="(mtd, index)  in result.jobMetaproperties">
            <span  v-if="index=='c0ac0a86e65f4f7ebd88dbd7e77965ef'&& mtd!=''">
              <span v-for="ddt in result.jobMetaData.filter(data => data.tempId=='c0ac0a86e65f4f7ebd88dbd7e77965ef')">
                  G-{{ddt.options.filter(dd=> dd.ID.split("-").join("")==mtd)[0].label}}
              </span>
            </span>
          </span>
        </td>
        <td>
          <span v-for="(mtd, index)  in result.jobMetaproperties">
            <span  v-if="index=='7388493928bc4a9aa57ca65306ed1579'&& mtd!=''">
              <span v-for="ddt in result.jobMetaData.filter(data => data.tempId=='7388493928bc4a9aa57ca65306ed1579')">
                  M-{{ddt.options.filter(dd=> dd.ID.split("-").join("")==mtd)[0].label}}
              </span>
            </span>
          </span>
        </td>
        <td>
          <span v-for="(mtd, index)  in result.jobMetaproperties">
             <span v-if="index=='b447dc7d70b0420a8ac9ec9aeff78296'&& mtd!=''">
                L-{{mtd}}
             </span>
          </span>
        </td>
        <td>
          <span v-for="(mtd, index)  in result.jobMetaproperties">
            <span v-if="index=='87d538e6d3a442468b20426285aef253' && mtd!=''">
             {{mtd}}
            </span>
          </span>
        </td>
        <td>{{result.job_active_stage.status}}</td>
        <td>
          <!-- {{result.jobMetaproperties.e9074f5b472f41d4a92ac511e53da775}} -->
          {{ result.dateCreated | formatDate}}
          </td>
        <td>
          <!-- <span v-for="(mtd, index)  in result.jobMetaproperties">
            <span v-if="index=='57046bf7e7624ab5bc4b8e16664b4cf8' && mtd!=''">
             {{mtd}}
            </span>
          </span> -->
          <!-- <span v-for="mt in  result.joincollection4" if="mt.hasOwnProperty('job_date_finished')">
            {{mt.job_date_finished}}
          </span> -->
         
          {{result.job_date_finished | formatDate}}
          </td>
        <td>
          <!-- <span v-for="mt in  result.joincollection4" if="mt.hasOwnProperty('job_duration')">
           <a href="#" @click.prevent="openModalDuration(result.jobID)"> {{mt.job_duration}}</a>
          </span> -->
          <span v-if="result.CalDuration!=''">
             <a href="#" @click.prevent="openModalDuration(result.jobID)"> {{result.CalDuration.toFixed(1)}} Days</a>
           </span>
        </td>
        <td>
          <!-- {{  result.presetstages.filter((data)=> data.position==result.job_active_stage.position )}} -->
           <span  v-for="presetstagesDt in result.presetstages">
              <span v-if="result.job_active_stage.position == presetstagesDt.position" >
             <!-- <span class="hidden">{{result.job_active_stage.position}}</span>  -->
             {{presetstagesDt.name}}
              </span>
            </span>
        </td>
        <td> {{ stageDuration(result) }} Days</td>
        <td>
          <!-- <span>{{result.job_active_stage.position}}</span>
          {{result.joincollection[0].presetstages}} -->
          <!-- <span v-for=" pstages in result.joincollection[0].presetstages">
            <span v-if=" pstages.position== result.job_active_stage.position">
            {{pstages.responsibleID}}
            </span>
          </span> -->
          <!-- <span v-if="result.joincollection2.length >0 && result.joincollection2[0] && result.joincollection2[0].hasOwnProperty('fullName')">
          {{result.joincollection2[0].fullName}}
          </span> -->
            <span  v-for="presetstagesDt in result.presetstages">
              <span v-if="result.job_active_stage.position ==presetstagesDt.position" >
              {{ responcibleTeam(presetstagesDt.name , result.presetName ) }}
              </span>
            </span>
          </td> 
        <td >-</td>
      </tr>
    </tbody>
  </table>
  <div>
  </div>
  	</div>
    <nav class="mt-3 d-flex justify-content-center" aria-label="nav" v-if="results.length > 0">
    <paginate
      v-model="currentPage"
      :page-count="totalPages"
      :page-range="5"
      :click-handler="clickCallback"
      :prev-text="'Prev'"
      :prev-class="'page-item'"
      :prev-link-class="'page-link'"
      :next-text="'Next'"
      :next-class="'page-item'"
      :next-link-class="'page-link'"
      :container-class="'pagination'"
      :page-class="'page-item'"
      :no-li-surround="true"
      :page-link-class="'page-link'">
    </paginate>
    </nav>
   </div>
   </div>
</div>
</div>
  </div>
</template>
<script>
  import moment from 'moment';
  import downloadExcel from 'vue-json-excel'
  import APIS from '@/lib/APIS';
  export default {
    name: 'FiltersTableVue',
    components:{ downloadExcel },
    props:['results','cls' ,'rowsPage','totalPages','jobID','openModalDuration','clickCallback','clearTempData','getExportDataPage'],
    data () {
    return {
        chk_boxAll:[],
        chk_box:[],
        currentPage: 1,
        //Page: 10z
         json_fields: {
            'Campaigns': {
              field: 'joincollection3',
                callback: (value) => {
                  return `${value[0].name}`;
                }
            },
            'Preset': {
              field: 'presetName', 
                callback: (value) => {
                  var dt=value;
                  return `${dt}`;
                }
            },
            'Job Key':  {
              field: 'job_key',
                callback: (value) => {
                 var dt="";
                 dt=value;
                return `${dt}`;
              }
            },  
            'Job Name':'name',
         //   'Metaproperties':{
         //     field: '',
         //       callback: (value) => {
                  
         //       var dt1="",dt2="" ,dt3="" ,dt4="";
         //       var jobMetaproperties=Object.entries(value.jobMetaproperties);
              'Grade':{
                 field: '',
                  callback: (value) => {
                    var dt="";
                   var jobMetaproperties=Object.entries(value.jobMetaproperties);
                  for(var index in jobMetaproperties){
                  if(jobMetaproperties[index][0]=='c0ac0a86e65f4f7ebd88dbd7e77965ef' && jobMetaproperties[index][1]!=""){
                    var jobMetaDataFilter=value.jobMetaData.filter(data => data.tempId==jobMetaproperties[index][0]);
                    for(var d=0; d<jobMetaDataFilter.length; d++ ){
                      var tempDt=jobMetaDataFilter[d].options.filter(dd=> dd.ID.split("-").join("")==  jobMetaproperties[index][1] );
                      if( tempDt.length>0 && tempDt[0].hasOwnProperty('label')){
                          dt="G-"+  tempDt[0].label;
                                  }
                                }
                              }
                          }
                        return `${dt}`;
                        }
                      },
                'Module':{
                 field: '',
                  callback: (value) => {
                    var dt="";
                   var jobMetaproperties=Object.entries(value.jobMetaproperties);
                  for(var index in jobMetaproperties){
                    if(jobMetaproperties[index][0]=='7388493928bc4a9aa57ca65306ed1579' && jobMetaproperties[index][1]!=""){
                    var jobMetaDataFilter=value.jobMetaData.filter(data => data.tempId==jobMetaproperties[index][0]);
                    for(var d=0; d<jobMetaDataFilter.length; d++ ){
                      var temp2=jobMetaDataFilter[d].options.filter(dd=> dd.ID.split("-").join("")==  jobMetaproperties[index][1] );
                      if(temp2.length >0 && temp2[0].hasOwnProperty('label')){
                        dt="M-"+  temp2[0].label;
                            }
                          }
                        }
                        }
                        return `${dt}`;
                        }
                      },
              'Lesson':{
                 field: '',
                  callback: (value) => {
                    var dt="";
                   var jobMetaproperties=Object.entries(value.jobMetaproperties);
                  for(var index in jobMetaproperties){
                    if(jobMetaproperties[index][0]=='b447dc7d70b0420a8ac9ec9aeff78296' && jobMetaproperties[index][1]!=""){
                   dt=jobMetaproperties[index][1] ;
                            }
                          }
                        return `${dt}`;
                        }
                      },
               'Component':{
                 field: '',
                  callback: (value) => {
                    var dt="";
                   var jobMetaproperties=Object.entries(value.jobMetaproperties);
                  for(var index in jobMetaproperties){
                    if(jobMetaproperties[index][0]=='87d538e6d3a442468b20426285aef253' && jobMetaproperties[index][1]!=""){
                   dt=jobMetaproperties[index][1] ;
                             } 
                          }
                        return `${dt}`;
                        }
                     },      
            'Current Status':{
              field: 'job_active_stage',
                callback: (value) => {
                 var dt="";
                 if(value!="" && value.hasOwnProperty('status')){
                   dt=value.status;
                 }
                    return `${dt}`;
                }
            },
            'Job Date Started':{
              field: 'dateCreated',
                callback: (value) => {
                 var dt="";
                 if(value!=""){
                   dt=value;
                 }
                return `${dt}`;
                }
            },
            'Job Date Finished':{
              field: 'job_date_finished',
                callback: (value) => {
                 var dt="";
                 if(value!=""){
                   dt=value;
                 }
                return `${dt}`;
                }
            },
            'Job Duration (Day)':{
              field: '',
                callback: (value) =>
                {
                   var dt="";
                  if(value.CalDuration!=''){
                    dt= value.CalDuration.toFixed(1);
                  }
                 return `${dt}`;
                }
            },
            /// joincollection
            'Current Stage':{
              field: '',
                callback: (value) => {
                var dt="";
                debugger
                if(value.hasOwnProperty('presetstages')){
                   var  presetstagesDt =value.presetstages;
                   var filterd=presetstagesDt.filter(data=> data.position== value.job_active_stage.position);
                   if(filterd.length>0){
                     dt=filterd[0].name;
                   }
                 }else if(value.hasOwnProperty("joincollection") && value.joincollection.length >0){
                   presetstagesDt =value.presetstages;
                   var filterd=presetstagesDt.filter(data=> data.position== value.job_active_stage.position);
                   if(filterd.length>0){
                     dt=filterd[0].name;
                   }
                 }
                return `${dt}`;
                }
            },
            'Current Stage Duration (Day)':{
              field: '',
                callback: (value) => {
                return `${ stageDuration( value) } `;
                }
            },
            'impact':{
              field: 'impact',
                callback: (value) => {
                var dt="";  dt=value;
                return `${dt}`;
                }
            },
            'risk':{
              field: 'risk',
                callback: (value) => {
                var dt=""; dt=value;
                return `${dt}`;
                }
            },
            'FPO Math Audit':{ field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("FPO Math Audit".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
            'Math Audit Review': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Math Audit Review".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
           'Math Managing Editor Feedback and Approval': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Math Managing Editor Feedback and Approval".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Complete Request Form': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Complete Request Form".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Content Team Feedback and Approval': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Content Team Feedback and Approval".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Feedback and Approval': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Feedback and Approval".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'A&P Record Keeping': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("A&P Record Keeping".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Asset Approval': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Asset Approval".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Contract negotiation and asset procurement': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Contract negotiation and asset procurement".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Copyright status': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Copyright status".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Research asset and original source': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Research asset and original source".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Review Image Permissions': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Review Image Permissions".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Select Job Type': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Review Image Permissions".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Waiting Room Preflight ': {field: '', callback: (value) => {
            /// need to be change as name
            //debugger
              var name= value.presetName;
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Waiting Room Preflight".toLowerCase())>-1);
              if(presets.length>0 && name.indexOf('Permission')>-1){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Art Production Lead Assigns Designer': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Art Production Lead Assigns Designer".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Art Production Lead Review': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Art Production Lead Review".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Create Asset': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Create Asset".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Designer Create Asset': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Designer Create Asset".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Review Image Design and Quality': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Review Image Design and Quality".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Team Lead Assigns Designer': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Team Lead Assigns Designer".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Waiting Room Preflight (Created Image)': {field: '', callback: (value) => {
              var name= value.presetName;
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Waiting Room Preflight".toLowerCase())>-1);
              if(presets.length>0 && name.indexOf("Created Image")> -1){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Approve and upload asset to the Waiting Room': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Approve and upload asset to the Waiting Room".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Evaluate Asset and Assign for Further Action': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Evaluate Asset and Assign for Further Action".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Search the DAM for existing assets': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Search the DAM for existing assets".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Verify permission and upload the clipart asset': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Verify permission and upload the clipart asset".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Verify permission and upload the contractor asset': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Verify permission and upload the contractor asset".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Waiting Room Preflight (For Clip Art or Storage Workflow)': {field: '', callback: (value) => {
              var name= value.presetName;
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Waiting Room Preflight".toLowerCase())>-1);
              if(presets.length>0 && name.indexOf("Clip Art")> -1){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Complete image research and provide options to writer': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Complete image research and provide options to writer".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Upload final image': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Upload final image".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'On Hold': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("On Hold".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          'Waiting Room Preflight': {field: '', callback: (value) => {
              var presets =value.presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
              presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Waiting Room Preflight".toLowerCase())>-1);
              if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
              return `${ duration } `; }},
          // 'Waiting Room Preflight': {field: '', callback: (value) => {
          //     var presets =value.joincollection[0].presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, duration=0;
          //     presets=presets.filter((data)=>data.name && data.name.toLowerCase().indexOf("Waiting Room Preflight")>-1);
          //     if(presets.length>0){ duration= getStageDuration(value.Preset_Stages, presets[0].position); }
          //     return `${ duration } `; }},
            
            // 'Second Stage Duration':{ field: '', callback: (value) => {
            //   return `${ getStageDuration(value.Preset_Stages, 2)||0 } `; }},
            // 'Third Stage Name': {field: '', callback: (value) => {
            //   var presets =value.joincollection[0].presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, stageName="-";
            //   for(let temp in presets){ if(presets[temp].position == 3){ stageName=presets[temp].name; } }
            //   return `${ stageName } `; }},
            // 'Third Stage Duration':{ field: '', callback: (value) => {
            //   return `${ getStageDuration(value.Preset_Stages, 3)||0 } `; }},
            // 'Fourth Stage Name': {field: '', callback: (value) => {
            //   var presets =value.joincollection[0].presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, stageName="-";
            //   for(let temp in presets){ if(presets[temp].position == 4){ stageName=presets[temp].name; } }
            //   return `${ stageName } `; }},
            // 'Fourth Stage Duration': { field: '', callback: (value) => {
            //  return `${ getStageDuration(value.Preset_Stages, 4)||0 } `; }},
            // 'Fifth Stage Name': {field: '', callback: (value) => {
            //   var presets =value.joincollection[0].presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, stageName="-";
            //   for(let temp in presets){ if(presets[temp].position == 5){ stageName=presets[temp].name; } }
            //   return `${ stageName } `; }},
            // 'Fifth Stage Duration': { field: '', callback: (value) => {
            //   return `${ getStageDuration(value.Preset_Stages, 5)||0 } `; }},
            // 'Sixth Stage Name': {field: '', callback: (value) => {
            //   var presets =value.joincollection[0].presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, stageName="-";
            //   for(let temp in presets){ if(presets[temp].position == 6){ stageName=presets[temp].name; } }
            //   return `${ stageName } `; }},
            // 'Sixth Stage Duration': { field: '', callback: (value) => {
            //   return `${ getStageDuration(value.Preset_Stages, 6)||0 } `; }},
            // 'Seventh Stage Name': {field: '', callback: (value) => {
            //   var presets =value.joincollection[0].presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, stageName="-";
            //   for(let temp in presets){ if(presets[temp].position == 7 ){ stageName=presets[temp].name; } }
            //   return `${ stageName } `; }},
            // 'Seventh Stage Duration': { field: '', callback: (value) => {
            //   return `${ getStageDuration(value.Preset_Stages, 7)||0 } `; }},
            // 'Eighth Stage Name': {field: '', callback: (value) => {
            //   var presets =value.joincollection[0].presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, stageName="-";
            //   for(let temp in presets){ if(presets[temp].position == 8 ){ stageName=presets[temp].name; } }
            //   return `${ stageName } `; }},
            // 'Eighth Stage Duration': { field: '', callback: (value) => {
            //   return `${ getStageDuration(value.Preset_Stages, 8 )||0 } `; }},
            // 'Ninth Stage Name': {field: '', callback: (value) => {
            //   var presets =value.joincollection[0].presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, stageName="-";
            //   for(let temp in presets){ if(presets[temp].position == 9 ){ stageName=presets[temp].name; } }
            //   return `${ stageName } `; }},
            // 'Ninth Stage Duration': { field: '', callback: (value) => {
            //   return `${ getStageDuration(value.Preset_Stages, 9 )||0 } `; }},
            // 'Tenth Stage Name': {field: '', callback: (value) => {
            //   var presets =value.joincollection[0].presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, stageName="-";
            //   for(let temp in presets){ if(presets[temp].position == 10 ){ stageName=presets[temp].name; } }
            //   return `${ stageName } `; }},
            // 'Tenth Stage Duration':{ field: '', callback: (value) => {
            //    return `${ getStageDuration(value.Preset_Stages, 10 )||0 } `; }},
            // 'Eleventh Stage Name': {field: '', callback: (value) => {
            //   var presets =value.joincollection[0].presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, stageName="-";
            //   for(let temp in presets){ if(presets[temp].position == 11 ){ stageName=presets[temp].name; } }
            //   return `${ stageName } `; }},
            // 'Eleventh Stage Duration':{ field: '', callback: (value) => {
            //    return `${ getStageDuration(value.Preset_Stages, 11 )||0 } `; }},
            // 'Twelfth Stage Name': {field: '', callback: (value) => {
            //   var presets =value.joincollection[0].presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, stageName="-";
            //   for(let temp in presets){ if(presets[temp].position == 12 ){ stageName=presets[temp].name; } }
            //   return `${ stageName } `; }},
            // 'Twelfth Stage Duration':{ field: '', callback: (value) => {
            //    return `${ getStageDuration(value.Preset_Stages, 12 )||0 } `; }},
            // 'Thirteenth Stage Name': {field: '', callback: (value) => {
            //   var presets =value.joincollection[0].presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, stageName="-";
            //   for(let temp in presets){ if(presets[temp].position == 13 ){ stageName=presets[temp].name; } }
            //   return `${ stageName } `; }},
            // 'Thirteenth Stage Duration':{ field: '', callback: (value) => {
            //    return `${ getStageDuration(value.Preset_Stages, 13 )||0 } `; }},
            // 'Fourteenth Stage Name': {field: '', callback: (value) => {
            //   var presets =value.joincollection[0].presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, stageName="-";
            //   for(let temp in presets){ if(presets[temp].position == 14 ){ stageName=presets[temp].name; } }
            //   return `${ stageName } `; }},
            // 'Fourteenth Stage Duration':{ field: '', callback: (value) => {
            //   return `${ getStageDuration(value.Preset_Stages, 14 )||0 } `; }},
            // 'Fifteenth Stage Name': {field: '', callback: (value) => {
            //   var presets =value.joincollection[0].presetstages, jobstages=value.job_stages, presetStages=value.Preset_Stages, stageName="-";
            //   for(let temp in presets){ if(presets[temp].position == 15 ){ stageName=presets[temp].name; } }
            //   return `${ stageName } `; }},
            // 'Fifteenth Stage Duration':{ field: '', callback: (value) => {
            //   return `${ getStageDuration(value.Preset_Stages, 15 )||0 } `; }},
            'Stage Responsible':{
              field: '',
                callback: (value) => {
                 var dt="";
                 if(value.presetstages.length >0){
                    var presets =value.presetstages;
                    presets=presets.filter((data)=> data.position== value.job_active_stage.position);
                    if(presets.length>0 ){
                     dt=  this.responcibleTeam( presets[0].name );
                     //
                    }
                 }
                 return `${dt}`;
                }
            },
            'Comment':{
              field: '',
                callback: (value) => {
                 return `-`;
                }
            },
        },
        json_meta: [
            [
                {
                    'key': 'charset',
                    'value': 'utf-8'
                }
            ]
        ],

      }
    },
    methods: {
       getDurationStages(data){

       },
       getDurationByArray(data){
            var date1, date2;
            if(data.hasOwnProperty("position")){
              date1=new Date(data.start_date);
              if(data.hasOwnProperty('job_date_finished')){
                date2=new Date(data.job_date_finished);
              }else{
                date2=new Date();
              }
            }else if(data.hasOwnProperty("Stage_Position")){
                date1=new Date(data.Stage_Date_Started);
              if(data.hasOwnProperty("Stage_Date_Finished") && data.Stage_Date_Finished!=""){
                date2=new Date(data.Stage_Date_Finished);
              }else{
                date2=new Date();
              }
            }
            var diff=(( date2 -date1)/86400000).toFixed(1);
            return parseFloat(diff);
      },  responcibleTeam(name, PresetName){
        var Teamname="";
       if(name!=""){
         if(name.toLowerCase().indexOf("research asset and original source")!=-1 ||
         name.toLowerCase().indexOf("select job type")!=-1 ||
         name.toLowerCase().indexOf("copyright status")!=-1 ||
         name.toLowerCase().indexOf("contract negotiation and asset procurement")!=-1 ||
         name.toLowerCase().indexOf("review image permissions")!=-1 ||
         name.toLowerCase().indexOf("asset approval")!=-1 ||
         name.toLowerCase().indexOf("a&p record keeping")!=-1 ){
           Teamname="permissions Team";
         }else if(name.toLowerCase().indexOf("waiting room preflight")!=-1 && !!PresetName && PresetName.indexOf("Permission")!=-1){
           Teamname="permissions Team";
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
         name.toLowerCase().indexOf("approve and upload asset to the waiting room")!=-1 ){
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
       return Teamname;
      },
      stageDuration(result){
        var data =result.Preset_Stages.filter((data)=>data.position && data.position==result.job_active_stage.position);
        var data2 =result.Preset_Stages.filter((data)=>data.Stage_Position && data.Stage_Position==result.job_active_stage.position);
        var durations=0;
        if(data.length>0){
          for(let ddt in data){
            durations= durations  + this.getDurationByArray(data[ddt]);
          }
        }
        if(data2.length>0){
          for(let ddt in data2){
            durations= durations  + this.getDurationByArray(data2[ddt]);
          }
        }
        return durations;
      }, getStageDuration(stages, Stage_Position){
        var apisStageCalc=stages.filter((data)=>data.position && data.position==Stage_Position);
        var ExportData=stages.filter((data)=>data.Stage_Position && data.Stage_Position==Stage_Position);
        var durations=0;
        if(apisStageCalc.length>0){
          for(let temp in apisStageCalc){
            durations= durations  + this.getDurationByArray(apisStageCalc[temp]);
          }
        }
      },
      async fetchData(){
         var  data =await this.getExportDataPage();
         return data;
      },
      async delete_temp_data(){
        var data =await APIS.deletetempData(this.chk_box);
         for(let dtID in data){
         var indexNo= this.results.findIndex(result=>result.id==data[0]);
         this.results.splice(indexNo , 1);
        }
        this.chk_box=[];
      }, async clearTempDelete(){
        var data =await APIS.clearTempDelete();
      },
      dateDiff(date1, date2){
        var dateFirst = new Date(date1);
        var dateSecond = new Date(date2);
        var timeDiff = Math.abs(dateSecond.getTime() - dateFirst.getTime());
        return  Math.ceil(timeDiff / (1000  *3600*  24));
      }, exportAsExcel(){
        alert(11);
      }
    }

  }
  
      
  function dateDiffC(date1, date2){
        var dateFirst = new Date(date1);
        var dateSecond = new Date(date2);
        var timeDiff = Math.abs(dateSecond.getTime() - dateFirst.getTime());
        return  Math.ceil(timeDiff / (1000  *3600*  24));
      }
      function formatDate(date) {
        var monthNames = [
          "January", "February", "March",
          "April", "May", "June", "July",
          "August", "September", "October",
          "November", "December"
        ];

        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();

        return day + ' ' + monthNames[monthIndex] + ' ' + year;
      }

      function getDurationByArray(data){
            var date1, date2;
            if(data.hasOwnProperty("position")){
              date1=new Date(data.start_date);
              if(data.hasOwnProperty('job_date_finished')){
                date2=new Date(data.job_date_finished);
              }else{
                date2=new Date();
              }
            }else if(data.hasOwnProperty("Stage_Position")){
                date1=new Date(data.Stage_Date_Started);
              if(data.hasOwnProperty("Stage_Date_Finished") && data.Stage_Date_Finished!=""){
                date2=new Date(data.Stage_Date_Finished);
              }else{
                date2=new Date();
              }
            }
            var diff=(( date2 -date1)/86400000).toFixed(1);
            return parseFloat(diff);
      } 
      function getStageDuration(stages, Stage_Position){
        var apisStageCalc=stages.filter((data)=>data.position && data.position==Stage_Position);
        var ExportData=stages.filter((data)=>data.Stage_Position && data.Stage_Position==Stage_Position);
        var durations=0;
        if(apisStageCalc.length>0){
          for(let temp in apisStageCalc){
                 durations= durations  + getDurationByArray(apisStageCalc[temp]);
          }
        }
        if(ExportData.length>0){
          for(let temp in ExportData){
                 durations= durations  + getDurationByArray(ExportData[temp]);
          }
        }
        return durations;
      } 
      
      function stageDuration(result){
        var data =result.Preset_Stages.filter((dat)=>dat.position && dat.position==result.job_active_stage.position);
        var data2 =result.Preset_Stages.filter((dat)=>dat.Stage_Position && dat.Stage_Position==result.job_active_stage.position);
        var durations=0;
        if(data.length>0){
          for(let ddt in data){
            durations= durations  + getDurationByArray(data[ddt]);
          }
        }
        if(data2.length>0){
          for(let ddt in data2){
            durations= durations  + getDurationByArray(data2[ddt]);
          }
        }
        return durations;
      }
</script>
<style>
button#ddown1__BV_toggle_ {
    background: #fff;
    color: #000;
    padding: 12px 22px;
}
  .table-bordered th, .table-bordered td {  white-space: nowrap;}
</style>
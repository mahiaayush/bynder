<template>
  <div> 
    <div class="row">
    <div class="mt-3 col-12">
    <div class="card rounded-0">
    <div class="card-body">
    <div class="border-bottom pb-2">
            <div class="d-flex justify-content-between ">
              <div class="font-weight-bold">
                <h6> Search Result</h6>
              </div>
              <div class="chart-icon"> <a href="#" class="px-1"><i class="fa fa-refresh" aria-hidden="true"></i> </a> <a href="#" class="px-1"><i class="fa fa-arrows-alt" aria-hidden="true"></i> </a> <a href="#" class="px-1"> <i class="fa fa-times" aria-hidden="true"></i> </a> 
              
              <div class="btn-group">
  <b-dropdown id="ddown1" size="sm" class="m-md-2 btn-sm ">
    <b-dropdown-item><i class="fa fa-file-excel-o"></i> Excel</b-dropdown-item>
    <b-dropdown-item><i class="fa fa-file-pdf-o"></i> PDF</b-dropdown-item>
    <b-dropdown-item><i class="fa fa-trash">Delete</i></b-dropdown-item>
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

<div class="table-responsive-sm mt-3 ">
    <table class="table table-bordered">
     <thead class="thead-light">
      <tr>
        <th><input type="checkbox"></th>
        <th @click="sort('name')">Campaigns</th>
        <th>Preset</th>
        <th>Job Key</th>
        <th @click="sort('name')">Job Name</th>
        <th>Metaproperties</th>
        <th>Current Status</th>
        <th>Job Duration</th>
        <th>Current Stage</th>
        <th>Current Stage Duration</th>
        <th>Stage Responsible</th>
        <th>Comment</th>
        <!--<th>Action</th>-->
      </tr>
    </thead>
    <tbody :class="cls">
      <tr v-for='result in results'>
       <td><input type="checkbox"></td>
        <td>{{result.joincollection3[0].name}}</td>
        <td><span v-if="result.hasOwnProperty('joincollection') && result.joincollection.length>0 && result.joincollection[0].hasOwnProperty('name')">{{result.joincollection[0].name}}</span></td>
        <td><span v-if="result.joincollection4.length>0">
          <!--<a href="https://greatminds.getbynder.com/workflow/job/view/{{result.jobID}>-->
          {{result.joincollection4[0].job_key}}-{{result.jobID}}
          <!--</a>-->
          </span>
        </td>
        <td>{{result.name}}</td>
         <td>
           <span v-for="(mtd, index)  in result.jobMetaproperties"
             v-if="index=='87d538e6d3a442468b20426285aef253' && mtd!=''">
           {{mtd}}
           </span>
           <span v-for="(mtd, index)  in result.jobMetaproperties"
             v-if="index=='b447dc7d70b0420a8ac9ec9aeff78296'&& mtd!=''">
           , L-{{mtd}}
          </span>
          <!-- <span v-for="(mtd, index)  in result.jobMetaproperties"
             v-if="index=='7388493928bc4a9aa57ca65306ed1579'&& mtd!=''">
             
           M-{{mtd}}
          </span> -->
          <span v-for="(mtd, index)  in result.jobMetaproperties"
             v-if="index=='7388493928bc4a9aa57ca65306ed1579'&& mtd!='' && result.jobMetaData[0].options.length> 0">
             <span v-for="opt in result.jobMetaData[0].options"
             v-if="opt.ID.split('-').join('')==mtd && opt.label!=''">
             , M-{{opt.label}}
           </span>
          </span>
          <span v-for="(mtd, index)  in result.jobMetaproperties"
             v-if="index=='c0ac0a86e65f4f7ebd88dbd7e77965ef'&& mtd!='' && result.jobMetaData[0].options.length> 0">
             <span v-for="opt in result.jobMetaData[0].options"
             v-if="opt.ID.split('-').join('')==mtd">, G-{{opt.label}}
           </span>
          </span>
          <!-- {{result.jobMetaData[0].options}} -->
          <!-- <span v-for="metaData in result.jobMetaData" 
          v-if=" metaData.tempId=='c0ac0a86e65f4f7ebd88dbd7e77965ef' ||
    metaData.tempId=='7388493928bc4a9aa57ca65306ed1579'||
    metaData.tempId=='b447dc7d70b0420a8ac9ec9aeff78296'||
    metaData.tempId=='87d538e6d3a442468b20426285aef253'">
            {{metaData.label}}, 
          </span>-->
          </td>
        <td>{{result.job_active_stage.status}}</td>
        <td ><p v-for="mt in  Object.entries(result.jobMetaproperties)" 
          v-if="mt[0]=='57046bf7e7624ab5bc4b8e16664b4cf8'"
          > {{ dateDiff(mt[1], result.dateCreated)}}</p></td>
        <td>
          <span v-if="result.joincollection.length>0 && result.joincollection[0].hasOwnProperty('presetstages')">
          <span
          v-for="presetstagesDt in result.joincollection[0].presetstages"
          v-if="result.job_active_stage.position ==presetstagesDt.position"
          >{{presetstagesDt.name}}</span></span></td>
        <td>-
          <span v-if="result.joincollection4.length >0 && result.joincollection4[0].hasOwnProperty('Preset_Stages')">
          <span v-if="result.joincollection.length>0 && result.joincollection[0].hasOwnProperty('presetstages')">
          <span v-for="Stages in result.joincollection4[0].Preset_Stages" 
          v-if="Stages.Stage_Position== result.job_active_stage.position">
          
          {{Stages}}
          </span>
          </span>
          </span>
          </td>
        <td v-if="result.joincollection2.length>0 && result.joincollection2[0] && result.joincollection2[0].hasOwnProperty('fullName')">
          {{result.joincollection2[0].fullName}}</td> 
        
        
        <td >-</td>
       <!-- <td></td> -->
      </tr>
    </tbody>
  </table>
		</div>
   </div>
   </div>
</div>
</div>
  </div>
</template>

<script>
  export default {
    name: 'FiltersTableVue',
    props:['results','cls'],
    methods: {
      dateDiff(date1, date2){
        var dateFirst = new Date(date1);
        var dateSecond = new Date(date2);
        var timeDiff = Math.abs(dateSecond.getTime() - dateFirst.getTime());
        return  Math.ceil(timeDiff / (1000  *3600*  24));
      }
    }

  }
</script>

<style lang="css" scoped>
table{font-size: 12px;}
.loading {
  background: #2a2c2e91;
  opacity: 0.8;
}
</style>

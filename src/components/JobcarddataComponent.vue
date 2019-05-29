<template>
<section class="px-3">
  
  <input-components 
  :compaigns='compaigns' 
  :WkPresets="WkPresets"
  :jobTypes='jobTypes'
  :Module='Module'
  :Grade="Grade"
  :curStatusDts='curStatusDts' :frmDataSubmit="frmDataSubmit" :frm="frm"
  ></input-components>

  <!-- <filters-table-vue 
  :results='results' :cls="cls" 
  :currentPage="currentPage"
  :rowsPage="rowsPage"
  :totalPages="totalPages"
  :jobID="jobID"
  :openModalDuration="openModalDuration"
  :clickCallback="clickCallback"
  :chk_box="chk_box"
  :delete_temp_data="delete_temp_data"
  :clearTempData="clearTempData"
  :getExportDataPage="getExportDataPage"
  ></filters-table-vue> -->
    <div>
      <ag-grid-vue headerName="Bynder Job Card Reports" style=" height: 500px;"
                 class="ag-theme-balham"
                 :columnDefs="columnDefs"
                  :rowData="rowData"
                  rowSelection="multiple"
                  pagination=true
                  >
      </ag-grid-vue>
    </div>

  <jobDurationComponent 
  :showModalDuration="showModalDuration" 
  :chartDisplayData="chartDisplayData" 
  ></jobDurationComponent>
</section>
</template>
<script>
import {AgGridVue} from "ag-grid-vue";
import  InputComponents from '@/components/InputComponent.vue';
import  CurrencyComponent from '@/components/CurrencyComponent.vue';
//import  CampaignsName from '@/components/agGrideFormater';
let SquareComponent = {
    template: '<span>{{ valueSquared() }}</span>',
    methods: {
        valueSquared() {
          debugger
            return  JSON.stringfy(this.params);;
        }
    }
};
import  FiltersTableVue from '@/components/FiltersTableVueComponent.vue';
import  jobDurationComponent from '@/components/jobDurationComponent.vue';
import APIS from '@/lib/APIS';
import { parse } from 'path';
 export default {
    components: {
      AgGridVue,
      CurrencyComponent,
      InputComponents,
      FiltersTableVue,
      jobDurationComponent
    }, data : () =>({
        columnDefs: null,
        rowData: null,
      chk_box:[],
      showModalDuration: false,
      jobID: '',
      active:'',
      currentPage:1,
      rowsPage:10,
      totalPages:0,
      jobCards:[],
      Grade:[],
      Module:[],
      compaigns:[],
      WkPresets:[],
      jobTypes:[],
      curStatusDts:[],
      frm:[],
      frmobj:[],
      results:[],
      totalRows:0,
      cls:'',
      chartDisplayData : [
        ["Stage Name", "Stage Duration (In Days)", {role:'style'}]
      ]
    }),
    computed:{
     // this.autocompleteItems=  APIS.getCurrentStatus()
     //getJobByCampaignid
    }, beforeMount() {
            this.columnDefs = [
                {
                  headerName: 'Campaigns', 
                  field: 'joincollection3',
                  cellRenderer: function(params) {
                      return params.value[0].name ;
                  },
                  //pinned: 'left',
                  checkboxSelection: true
                },
                {headerName: 'Preset', field: 'joincollection',
                  cellRenderer: function(params) {
                      return params.value[0].name ;
                  },
                  //pinned: 'left',
                },
                { headerName: 'Job Key',
                 // field: "price", 
                  //cellRendererFramework: CurrencyComponent,
                  field: "job_key",
                  // cellRenderer: function(params) {
                  //     return params.value ;
                  // },
                  colId: "params", 
                  //pinned: 'left',
                },
                {headerName: 'Job Name', field: 'name'
                 //,pinned: 'left',
                 },
                {headerName: 'Grade',
                  field: 'jobMetaproperties',
                  field: 'id',
                  cellRenderer : function(params) {
                    debugger
                      return params.value ;
                  },
                },
                {headerName: 'Module', field: 'price'},
                {headerName: 'Lession', field: 'price'},
                {headerName: 'Component', field: 'price'},
                {headerName: 'Current Status', field: 'price'},
                {headerName: 'Job Date Started', field: 'price'},
                {headerName: 'Job Date Finished', field: 'price'},
                {headerName: 'Job Duration', field: 'price'},
                {headerName: 'Current Stage', field: 'price'},
                {headerName: 'Current Stage Duration', field: 'price'},
                {headerName: 'Stage Responsible', field: 'price'},
                {headerName: 'Comment', field: 'price'},
            ];
            this.rowData=[];
          //   var thatRow=this;
          // fetch('https://api.myjson.com/bins/15psn9') .then(result => result.json()).then((rowData) =>{
          //   alert("www");
          //   debugger

          //   thatRow.rowData= rowData
          // } ).catch((Err)=>{
          //     console.log("Error in fetch data ", Err);
          //   });
        },
    async mounted() {
      this.compaigns= await APIS.getAllCompangns();
      const jobtypes = await APIS.getJobType();
      this.WkPresets=APIS.getPrestsGroup();
      this.jobTypes=jobtypes[0].options
      var dtgrade  =await APIS.getGrade();
      this.Grade =dtgrade[0].options;
      var dtmodule=await APIS.getModule();
      this.Module=dtmodule[0].options;
    },
    methods :{
      async getExportDataPage(){
        debugger
        console.log(this.frmobj);
        var response=await APIS.exportAsExcel(this.frmobj);
        console.log("data is given ", response);
        return response;
        
      },
      clearTempData(data){
        for(let dtID in data){
         var indexNo= this.results.findIndex(result=>result.id==data[0]);
         this.results.splice(indexNo , 1);
        }
    },
      delete_temp_data(){
        // eslint-disable-next-line
        console.log(this.chk_box);
      }, getColorByName(name){
        var colorCode="#FF5B34";
        if(name!=""){
          if(name.toLowerCase().indexOf("research asset and original source")!=-1 || 
          name.toLowerCase().indexOf("select job type")!=-1 || 
          name.toLowerCase().indexOf("copyright status")!=-1 || 
          name.toLowerCase().indexOf("contract negotiation and asset procurement")!=-1 || 
          name.toLowerCase().indexOf("asset approval")!=-1 || 
          name.toLowerCase().indexOf("a&p record keeping")!=-1 ){
            colorCode="#7DBA51";
          }
          else if(name.toLowerCase().indexOf("art production lead assigns designer")!=-1 || 
          name.toLowerCase().indexOf("designer create asset")!=-1 || 
          name.toLowerCase().indexOf("art production lead review")!=-1 || 
          name.toLowerCase().indexOf("waiting room preflight")!=-1 ){
            colorCode="#136353";
          }
          else if(name.toLowerCase().indexOf("search the dam for existing assets")!=-1 || 
          name.toLowerCase().indexOf("verify permissions and upload the clip art asset")!=-1 || 
          name.toLowerCase().indexOf("approve and upload asset to the waiting room")!=-1 ){
            colorCode="#CAE6CF";
          }else if(name.toLowerCase().indexOf("complete image research and provide options to writer")!=-1 || 
          name.toLowerCase().indexOf("upload final image")!=-1 ){
            colorCode="#07212D";
          }else if(name.toLowerCase().indexOf("content team feedback and approval")!=-1 ){
            colorCode="#D3EEFB";
          }else{
            colorCode="#FF5B34";
          }
        }
        return colorCode;
      },
      async openModalDuration(jobID){
        this.chartDisplayData=this.newchartDisplayData();
        let dts  =await APIS.getJobDurationData(jobID);
        var  dds=dts.bynder_jobs;
          if( dds.length > -1 ){
           if(dds[0].Preset_Stages.length > -1){
              var Preset_Stages=dds[0].Preset_Stages;
              var presetstages=dds[0].c[0].presetstages;
              var NewPreset_Stages=[];
              var StageIDs=[];
              var StageNames=[];
              for(var dt in Preset_Stages ){
                var name="", id="", position="", Stage_Duration="",colorCode="";
                if(Preset_Stages[dt].hasOwnProperty("id") && StageIDs.indexOf(Preset_Stages[dt].id)== -1){
                    id=Preset_Stages[dt].id;
                    position=Preset_Stages[dt].position;
                    var presetData=presetstages.filter((data)=>data.position==Preset_Stages[dt].position);
                  if(presetData.length > 0){
                    name=presetData[0].name;
                    colorCode=this.getColorByName(name);
                  }
                  debugger
                  Stage_Duration=dateDiffinDurationStage(Preset_Stages[dt].job_date_finished  , Preset_Stages[dt].start_date );
                 // Preset_Stages[dt].job_date_finished   Preset_Stages[dt].start_date
                  NewPreset_Stages.push({ id: id, position:position, name:name , Stage_Duration: parseFloat(Stage_Duration) , color:colorCode});
                  StageIDs.push(id);
                }else if(Preset_Stages[dt].hasOwnProperty("Stage_Name") && Preset_Stages[dt].Stage_name!="" && StageNames.indexOf(Preset_Stages[dt].Stage_Name)== -1){
                    
                    name=Preset_Stages[dt].Stage_Name;
                    colorCode=this.getColorByName(name);
                    position=Preset_Stages[dt].Stage_Position;
                    if(Preset_Stages[dt].Stage_Duration!=""){
                     Stage_Duration =parseInt(Preset_Stages[dt].Stage_Duration.split("day")[0]);
                    }else{
                      Stage_Duration =dateDiffinDurationStage(Preset_Stages[dt].Stage_Date_Finished  , Preset_Stages[dt].Stage_Date_Started );
                    }
                    NewPreset_Stages.push({ Stage_Date_Started: Preset_Stages[dt].Stage_Date_Started,
   Stage_Date_Finished:  Preset_Stages[dt].Stage_Date_Finished, position:position, name:name , Stage_Duration:Stage_Duration , color:colorCode});
                    StageNames.push(name);
                    //Stage_Duration=Preset_Stages[dt].Stage_Duration;
                }else if(Preset_Stages[dt].hasOwnProperty("id") ){
                  var existingDT= NewPreset_Stages.filter((data)=> data.id== Preset_Stages[dt].id );
                  Stage_Duration=dateDiffinDurationStage( Preset_Stages[dt].job_date_finished, Preset_Stages[dt].start_date );
                  existingDT[0].Stage_Duration=existingDT[0].Stage_Duration+Stage_Duration;
                }else if(Preset_Stages[dt].hasOwnProperty("Stage_Name") && Preset_Stages[dt].Stage_Name!="" ){
                  var existingDT= NewPreset_Stages.filter((data)=> data.Stage_Names== Preset_Stages[dt].name );
                    if(Preset_Stages[dt].Stage_Duration!=""){
                     Stage_Duration =parseInt(Preset_Stages[dt].Stage_Duration.split("day")[0]);
                    }else{
                      Stage_Duration =dateDiffinDurationStage(Preset_Stages[dt].Stage_Date_Finished  , Preset_Stages[dt].Stage_Date_Started );
                    }
                  existingDT[0].Stage_Duration=existingDT[0].Stage_Duration+Stage_Duration;
                }
              }
              console.log("data is ===>", NewPreset_Stages);
              //var dts=[{Preset_Stages:NewPreset_Stages}];
              debugger
              this.chartDisplayData=[
                  ["Stage Name", "Stage Duration (In Days)", {role:'style'}]
                ];
                if(NewPreset_Stages.length>0){


             var chartDisplayData = [
                  ["Stage Name", "Stage Duration (In Days)", {role:'style'}]
                ];
               
              for(let ttt in NewPreset_Stages){
                var d=[ NewPreset_Stages[ttt].name, NewPreset_Stages[ttt].Stage_Duration, NewPreset_Stages[ttt].color ];
                        chartDisplayData.push(d);
              }
                }
              this.chartDisplayData=chartDisplayData;
            }
          }
         
      this.$children[2].chartData=this.chartDisplayData;
      this.$modal.show('hello-world');
      }, newchartDisplayData(){
        return [ ["Stage Name", "Stage Duration (In Days)", {role:'style'}]];
      },
      async clickCallback(pageNum){
        this.frmobj.currentPage=pageNum;
        this.cls="loading";
        //this.results=  await APIS.getjobsbycampaignid(this.frmobj);
        var data =  await APIS.getjobsbycampaignid(this.frmobj);
        this.results=data.rows;
        this.totalRows=data.rowCount;
        this.cls="";
      }, async  frmDataSubmit(obj, tags){
        var a=[];
        if(tags.length >0){
          for(let i=0; i<tags.length; i++){
            a.push(tags[i].text);
          }
        }
        this.currentPage=1;
        obj.currentPage=this.currentPage;
        obj.rowsPage=this.rowsPage;
        obj.currentStatus=a;
        this.frmobj=obj;
        this.cls="loading";
        var data =  await APIS.getjobsbycampaignid(obj);
        this.results=data.rows;
        debugger
        this.rowData=data.rows;
        this.totalRows=data.rowCount;
        var pages=1;
        if(data.rowCount % this.rowsPage!=0){
          pages=Math.round(data.rowCount/ this.rowsPage,1)+1;
        }else{
          pages=data.rowCount/ this.rowsPage;
        }
        this.totalPages= pages;
        //console.log(data);
        this.cls="";
      },
    }
  }

// function dateDiffinDuration(date1, date2){ 
//   var dateFirst, dateSecond;
//   if(!(date1 instanceof Date )){
//     dateFirst = new Date (date1);
//     dateSecond = new Date(date2);
//   }else{
//     dateFirst = date1;
//     dateSecond = date2;
//   }
//   var timeDiff = Math.abs(dateSecond.getTime() - dateFirst.getTime());
//   var Minuts=Math.round((timeDiff/1000)/60);
//   return  Minuts/60; // in Minuts
// }
// function dateDiffinDurationStage(date2, date1){
//   var d2, d1=new Date(date1);  
//   if( typeof date2 === "undefined"|| date2 === null  ||date2==""){
//     d2=new Date();
//   }else{
//     d2=new Date(date2);
//   }
//   var timeDiff = Math.abs(d2.getTime() - d1.getTime());
//   return parseFloat(timeDiff/86400000).toFixed(1);
// }

</script>
<style lang="css" >
  table{font-size: 10px;}
  .loading {
    background: #2a2c2e91;
    opacity: 0.8;
  }
  .page-link.active{
  background: #f3f3f3;
  }
  .disable{

  }
</style>
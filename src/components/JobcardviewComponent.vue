<template>
<section>
  <input-components 
  :compaigns='compaigns' 
  :WkPresets="WkPresets"
  :jobTypes='jobTypes'
  :Module='Module'
  :Grade="Grade"
  :curStatusDts='curStatusDts' :frmDataSubmit="frmDataSubmit" :frm="frm" :compaignIdChanged="compaignIdChanged"
  ></input-components>
  <filters-table-vue 
  :results='results' :cls="cls" 
  ></filters-table-vue>
</section> 
</template>
<script>
import  InputComponents from '@/components/InputComponent.vue';
import  FiltersTableVue from '@/components/FiltersTableVueComponent.vue';
import APIS from '@/lib/APIS';
 export default {
    components: {
      InputComponents,
      FiltersTableVue,
     // VueTagsInput
    }, data : () =>({
      jobCards:[],
      Grade:[],
      Module:[],
      compaigns:[],
      WkPresets:[],
      jobTypes:[],
      curStatusDts:[],
      frm:[],
      results:[],
      cls:'',
    }),
    computed:{
     // this.autocompleteItems=  APIS.getCurrentStatus()
     //getJobByCampaignid
    },
    async mounted() {
      this.compaigns= await APIS.getAllCompangns();
      const jobtypes = await APIS.getJobType();
      this.WkPresets=APIS.getPrestsGroup();
    console.log(this.WkPresets);
      this.jobTypes=jobtypes.options
      var dtgrade  =await APIS.getGrade();
      this.Grade =dtgrade[0].options;
        var dtmodule=await APIS.getModule();
        this.Module=dtmodule[0].options;
    },
    methods :{
      getJobs(){
        //const apidata=APIS.getAllCompangns();
        //console.log(apidata);
      }, async  frmDataSubmit(obj, tags){
       // debugger
       var a=[];
        if(tags.length >0){
          for(let i=0; i<tags.length; i++){
            a.push(tags[i].text);
          }
        }
        obj.currentStatus=a;
        this.cls="loading";
       this.results=  await APIS.getjobsbycampaignid(obj);
       this.cls="";
      },
     async compaignIdChanged(){
       
       //this.WkPresets=  await APIS.getPrestsGroup();
      }
    }
  }
</script>
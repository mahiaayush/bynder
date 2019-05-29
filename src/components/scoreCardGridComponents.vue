<template>
<modal 
    width="70%"
    height="65%"
    adaptive="adaptive"
    scrollable="scrollable"
    name="hello-world">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">OVERDUE JOBS LIST</h4>
        </div>
        <div class="modal-body containerdt">
            <div style="height:325px; overflow:scroll">
            <!-- <b-table striped hover :items="items" :fields="fields" /> -->
             <b-table striped hover :items="items" :fields="fields">
                <template v-for='field in formatted' :slot='field' slot-scope='row'>
                    <span v-html='formatter(row.value, field)'></span>
                </template>
            </b-table>
            </div>
        </div>
    </div>
</modal>
</template>
<script>
import PropTypes from 'prop-types';
//import APIS from '@/lib/APIS';
export default {
    components: {
      //GChart
    },
    data () {
        return {
           jobID: this.$route.params.jobid,
           scrollable:true,
           adaptive:true,
           formatted: ['name','job_key','dateCreated','job_date_finished'],
           fields: [{ key: 'campaignJoin[0].name', label: 'Campaign Name', sortable: true },
                    { key: 'name', label: 'Job Name', sortable: true },
                    { key: 'job_key', sortable: true },
                    //{ key: 'Job_Name', sortable: true },
                    { key: 'CalDuration', label: 'Job Duration(in Days)', sortable: true },
                    { key: 'dateCreated', label: 'Job Date Created', sortable: true },
                    { key: 'job_date_finished', sortable: true },
                    // { key: 'first_name', sortable: false},
                    // {key: 'age',label: 'Person age',sortable: true,/* variant: 'danger'*/}

                    //{campaignID:1,  name:1, job_key:1, job_duration:1, job_date_started:1, job_date_finished:1}
           ],
        items: [
            // { isActive: true, age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
            // { isActive: false, age: 21, first_name: 'Larsen', last_name: 'Shaw' },
            // { isActive: false, age: 89, first_name: 'Geneva', last_name: 'Wilson' },
            // { isActive: true, age: 38, first_name: 'Jami', last_name: 'Carney' }
             ]
      }
     
    },
     methods: {
    formatter: function(data, filed) {
       // debugger  
        var value="";
        if((filed=="dateCreated" && data!="" && data!= null)||( filed=="job_date_finished" && data!="" && typeof data !="undefined" && data!= null)  ){
          if(filed=="job_date_finished"){
              console.log("==>",data,"=>", typeof data, "==>", data== null,"\n");
          }
           var date= new Date(data);
           var m=date.getMonth(), d=date.getDate();
           value=  ((m< 9)?"0"+m:m)+"-"+ ((d< 9)?"0"+d:d) +"-"+ date.getFullYear();
           value= '<b>' + value + '</b>';
        }else if(filed=="name" && data!="" && data!= null){
             value= '<b title="'+ data +'">' + data.substring(0, 15) + '</b>';
        }else if(filed=="job_key" && data!="" && data!= null){
             value= '<a target="_blank" href="https://greatminds.getbynder.com/workflow/job/view/'+ data +'/">' + data + '</b>';
        }
      return value;
    }
  }
}
//vm.$forceUpdate();
</script>
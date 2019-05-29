<template>
<modal width="70%" height="75%" adaptive="adaptive" scrollable="scrollable" name="hello-world">
      <div class="modal-content">
        <!-- Modal Header -->
        <div class="modal-header">		
          <h5 class="modal-title">Stage Duration</h5>
		  <button type="button" @click.prevent="hideModal()" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
			</button>
        </div>
        <div class="modal-body containerdt">
            <GChart
           type="BarChart"
           :data="chartDisplayData"
           :options="chartOptions"
           :resizeDebounce="500"></GChart>
        </div>
    </div>
</modal>
</template>
<script>
import PropTypes from 'prop-types';
import { GChart } from 'vue-google-charts';
import APIS from '@/lib/APIS';
export default {
    components: {
      GChart
    },props: ['showModalDuration','chartDisplayData','hide_modal'], //'active','isActive','carlist',
    data () {
        return {
           jobID: this.$route.params.jobid,
           chartData : this.chartDisplayData.length ,
                        adaptive:true,
                        scrollable:true,// ?this.chartDisplayData ? [
            //     ["Stage Name", "Stage Duration (In Days)", {role:'style'}]
            //     ["-",1]
            // ],
            chartOptions : {
                title: 'Stage Calculation',
				chartArea: {left: '30%'},
				 hAxis: {
                    minValue: 0
                },
                vAxis: {
                title: 'Stage Name'
                },
				titleTextStyle: { color: '#07212d', fontName: 'Karla', fontSize: '14' },
				fontSize:10,
                width: 800,
                height: 350,
                legend: { position: 'bottom' },
                colors: ['#fff','green']
            }
        }
    },async mounted() {
      this.chartData=this.chartDisplayData;
    } ,methods:{
         setChartData(){
         this.chartData=this.chartDisplayData;
        }, hideModal(){
           this.$modal.hide('hello-world');
        }
    }
}
//vm.$forceUpdate();
</script>
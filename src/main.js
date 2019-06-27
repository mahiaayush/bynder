import Vue from 'vue';
import App from './App.vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import bPagination from 'bootstrap-vue/es/components/pagination/pagination';
Vue.component('b-pagination', bPagination);
import Paginate from 'vuejs-paginate'
Vue.component('paginate', Paginate)
import VueRouter from 'vue-router';
Vue.use(VueRouter);
import BootstrapVue from 'bootstrap-vue';
Vue.use(BootstrapVue);
import { Modal } from 'bootstrap-vue/es/components';
Vue.use(Modal);
import VueGoogleCharts from 'vue-google-charts';
Vue.use(VueGoogleCharts);
import VueAxios from 'vue-axios';
import axios from 'axios';
Vue.use(VueAxios, axios);
Vue.config.productionTip = false;
import HomeComponent from './components/HomeComponent.vue';
import CreateComponent from './components/CreateComponent.vue';
import IndexComponent from './components/IndexComponent.vue';
import EditComponent from './components/EditComponent.vue';

import JobcardviewComponents from './components/JobcardviewComponent.vue';
import ScorecardviewComponent from './components/ScorecardviewComponent.vue';
import jobDurationComponent from './components/jobDurationComponent.vue';
import ScoreCardGridComponents from './components/scoreCardGridComponents.vue';
import JobcarddataComponents from './components/JobcarddataComponent.vue';
import moment from 'moment';
import VModal from 'vue-js-modal';
Vue.use(VModal);
//  import store from './store'

//import InputComponents from './components/InputComponents.vue';


const routes = [
  {
      name: 'home',
      path: '/',
      component: HomeComponent
  },
  /*
  {
      name: 'create',
      path: '/create',
      component: CreateComponent
  },*/
  {
      name: 'jobDuration',
      path: '/jobDuration/:jobid',
      component: jobDurationComponent
  },
  {
    name: 'scoreCardGrid',
    path: '/scoreCardGrid/:jobid',
    //scoreCardGridComponents
    component: ScoreCardGridComponents
    },
  {
    name:'jobcardview',
    path: '/jobcardview',
    component: JobcardviewComponents
  },{
    name:'jobcarddata',
    path: '/jobcarddata',
    component: JobcarddataComponents
  }, //
  {
    name:'scorecardview',
    path: '/scorecardview',
    component: ScorecardviewComponent
  },{
      name: 'edit',
      path: '/edit/:id',
      component: EditComponent
  }
];
String.prototype.decode=function(){
 // Array.prototype.insert = function ( index, item ) { 
   /// this.splice( index, 0, item ); };
  var a= this.split("");
  a.splice( 8, 0 , "-");
  a.splice( 13, 0 , "-");
  a.splice( 18, 0 , "-");
  a.splice( 23, 0 , "-");
 // a.insert(23,"-");
  return a.join("");
};
const router = new VueRouter({ mode: 'history', routes: routes});
Vue.filter('formatDate', function(value) {
  if (value) {
    return moment(String(value)).format('MM-DD-YYYY');
  }
});
new Vue(Vue.util.extend({ router }, App)).$mount('#app');

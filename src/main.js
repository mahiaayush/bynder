import Vue from 'vue';
import App from './App.vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import VueRouter from 'vue-router';
Vue.use(VueRouter);
import BootstrapVue from 'bootstrap-vue';
Vue.use(BootstrapVue);
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
//  import store from './store'

//import InputComponents from './components/InputComponents.vue';


const routes = [
  {
      name: 'home',
      path: '/',
      component: HomeComponent
  },/*
  {
      name: 'create',
      path: '/create',
      component: CreateComponent
  },
  {
      name: 'posts',
      path: '/posts',
      component: IndexComponent
  },*/
  {
    name:'jobcardview',
    path: '/jobcardview',
    component: JobcardviewComponents
  },
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

const router = new VueRouter({ mode: 'history', routes: routes});

new Vue(Vue.util.extend({ router }, App)).$mount('#app');

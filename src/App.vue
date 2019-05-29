<template>
<div class="wrapper">
  <nav id="sidebar">
    <div class="sidebar-header text-center">
      <h3><img src="https://greatminds.mpstechnologies.com/GreatMinds/assets/images/brand-logo-home.svg" style="max-width: 70%; width: 100%;" alt="Great Minds"></h3>
      <strong><img src="https://greatminds.mpstechnologies.com/GreatMinds/assets/images/brand-logo-home.svg" style="max-width: 70%; width: 100%;" alt="Great Minds"></strong>
      <div class="profile-wrap">
        <p class="mnp-name text-center mt-3">Admin</p>
        <p class="mnp-user-role text-center">Super User</p>
        <!-- <div class="text-center mt10 pb20 mb10"> <span class="user-icon"><a href="https://greatminds.mpstechnologies.com/GreatMinds/admin/taskDashBooks#" title="Edit Profile" onclick="checkIfSaved('/GreatMinds/admin/editUser?uid=168&amp;manageUser=editByUser');"><i class="fa fa-user" aria-hidden="true"></i> </a> </span> <span class="user-icon"> <a href="https://greatminds.mpstechnologies.com/GreatMinds/admin/taskDashBooks#" title="Logout" onclick="checkIfSaved('/GreatMinds/login/logoff');"> <i class="fa fa-sign-in" aria-hidden="true"></i> </a> </span> </div> -->
      </div>
    </div>
    <hr class="custom-border">
    <ul class="list-unstyled components">
      <li><router-link to="/scorecardview" class="nav-link"><i class="fa fa-line-chart"></i> Score Card View </a></router-link>
      <li><router-link to="/jobcardview" class="nav-link"><i class="fa fa-table"></i>Job Card View</router-link></li>
      <!-- <li><router-link to="/jobcarddata" class="nav-link"><i class="fa fa-table"></i>Job Card Grid</router-link></li> -->
    </ul>
  </nav>
    <!-- <nav class="navbar navbar-expand-sm bg-dark navbar-dark">
      <ul class="navbar-nav">
        <li class="nav-item">
          <router-link to="/" class="nav-link">Home</router-link>
        </li>
     
        <li class="nav-item">
          <router-link to="/jobcardview" class="nav-link">Job Card View</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/scorecardview" class="nav-link">Score Card View</router-link>
        </li>
      </ul>
    </nav> -->
    <div id="content">
      <nav class="navbar navbar-expand-lg navbar-light mb-0">
      <div class="container-fluid px-0">
        <button type="button" id="sidebarCollapse" class=" bg-white border-0"> <i class="fa fa-bars" aria-hidden="true"></i> </button>
        <!-- <div class="pull-right "> <a class="nav-link" href="#">Back to WMS</a> </div> -->
      </div>
    </nav>
    <transition name="fade">
      <router-view></router-view>
    </transition>
    </div>
  </div>
</template>

<style>
    .fade-enter-active, .fade-leave-active {
      transition: opacity .5s
    }
    .fade-enter, .fade-leave-active {
      opacity: 0
    }
</style>

<script>
    
    export default{
    }
</script>
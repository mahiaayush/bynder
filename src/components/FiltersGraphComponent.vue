<template>
  <div> <div class="row">
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
  <button type="button" class="btn btn-secondary dropdown-toggle btn-sm" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
<i class="fa fa-cog" aria-hidden="true"></i>
  </button>
  <div class="dropdown-menu dropdown-menu-right p-0">
    <button class="dropdown-item" type="button"><i class="fa fa-file-excel-o" ></i> Excel</button>
    <button class="dropdown-item" type="button"><i class="fa fa-file-pdf-o" ></i> PDF</button>
  </div>
</div>
</div>
</div>
</div>
<div class="table-responsive-sm mt-3">
  <table class="table table-bordered">
     <thead class="thead-light">
      <tr>
        <th>Firstname</th>
        <th>Firstname</th>
        <th>Lastname</th>
        <th>Email</th>
      </tr>
    </thead>
    <tbody>
      <tr>
       <td>John</td>
         <td>John</td>
        <td>Doe</td>
        <td>john@example.com</td>
      </tr>
      <tr>
       <td>John</td>
        <td>Mary</td>
        <td>Moe</td>
        <td>mary@example.com</td>
      </tr>
      <tr>
       <td>John</td>
        <td>July</td>
        <td>Dooley</td>
        <td>july@example.com</td>
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
    name: 'FiltersGraphVue',
    props: {
      componentType: {
        type: String,
        default: () => null
      }
    }
  }
</script>
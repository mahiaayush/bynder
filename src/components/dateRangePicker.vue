<template>
  <input type="text" class="form-control datapicker close-icon" :disabled="disabled" :value="value" autocomplete="off" :id="dateId">
</template>
<script>
export default {
  name: 'date-picker',
  props: [ 'dateFormat' ,'disabled','value','dateId'],
  data:{date:''},
  mounted: function() {
    //var vm = this;
    $(".datapicker").daterangepicker({
        autoUpdateInput: false,
        locale: { cancelLabel: 'Clear', format: 'YYYY-MM-DD' },
      });
    $(".datapicker").on('apply.daterangepicker', function(ev, picker) {
      $(this).val(picker.startDate.format('YYYY-MM-DD') + ' - ' + picker.endDate.format('YYYY-MM-DD'));
      //vm.$emit("update_StartDate", $(this).val());
      var id=$(this).attr("id");
      $(".datapicker").each(function(){
         if($(this).attr('id')!=id){
           $(this).attr("disabled",true);
           $(this).val('');
         }
       });
      });
      $(".datapicker").on('cancel.daterangepicker', function(ev, picker) {
          $(this).val('');
          jQuery(".datapicker").each(function(){
              $(this).removeAttr("disabled");
          });
      });
  }
}
</script>


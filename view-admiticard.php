<?Php 
define('MAX_REC_PER_PAGE', 12);
include('../functions.php');
?>
<?Php include('header.php');?>
<link href="../plugins/datatables/dataTables.bootstrap.css" rel="stylesheet" type="text/css" />
<link href="../dist/css/AdminLTE.min.css" rel="stylesheet" type="text/css" />
<link href="../dist/css/skins/_all-skins.min.css" rel="stylesheet" type="text/css" />
<div class="content-wrapper">
  <section class="content-header">
    <h1> List Of All Students <small>Page</small> </h1>
    <ol class="breadcrumb">
      <li><a href="index.php"><i class="fa fa-dashboard"></i> Home</a></li>
      <li class="active">Dashboard</li>
    </ol>
  </section>
  <section class="content">
    <div class="row">
      <div class="col-md-9">
        <div class="box">
          <div class="box-body">
            <div id="example1_wrapper" class="dataTables_wrapper form-inline dt-bootstrap">
              <div class="box-header"> </div>
              <div class="row">
                <form name="frmStudentRecords" id="frmStudentRecords" method="post">
                  <div class="col-md-3">
                    <div class="form-group">
                      <label>Class: </label>
                      <br/>
                      <select class="form-control select2 select2-hidden-accessible" tabindex="-1" aria-hidden="true" name="class" id="class" onChange="get_class_id(this.value);" style="width:200px">
                        <option value="">Select Course</option>
                        <?php get_select_list("tblcourse","cou_id","cou_name");?>
                      </select>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-group">
                      <label>Section: </label>
                      <br/>
                      <select class="form-control select2 select2-hidden-accessible" tabindex="-1" aria-hidden="true" name="section" id="section" style="width:200px">
                        <option value="">Select Section</option>
                      </select>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-group">
                      <label>Session: </label>
                      <br/>
                      <select class="form-control select2 select2-hidden-accessible" tabindex="-1" aria-hidden="true" name="session_year" id="session_year" style="width:200px">
                        <option value="">Select Session</option>
                        <?Php get_select_list("tblsession","session_name","session_name");?>
                      </select>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-group"><br />
                      <button class="btn btn-default" type="submit" name="bthAllStudents">Search Student</button>
                    </div>
                  </div>
                  <p>&nbsp;</p>
                </form>
                <div class="col-md-12" style="min-height:600px;">
                <form name="frm2" method="post" action="icard/printicard.php?class=<?php echo $_REQUEST['class'];?> & session=<?php echo $_REQUEST['session_year'];?>" target="_blank">
                  <table id="example" class="table table-bordered table-striped dataTable" role="grid" aria-describedby="example1_info">
                    <thead>
                      <tr>
                        <th class="header">Sr.No. <i class="fa fa-sort"></i></th>
                        <th class="header">Stu-Id. <i class="fa fa-sort"></i></th>
                        <th class="header">Student-Name <i class="fa fa-sort"></i></th>
                        <th class="header">Father-Name <i class="fa fa-sort"></i></th>
                        <th class="header">Class <i class="fa fa-sort"></i></th>
                        <th class="header">Section <i class="fa fa-sort"></i></th>
                        <th class="header">Date-of-Birth <i class="fa fa-sort"></i></th>
                        <th class="header">Action <i class="fa fa-sort"></i></th>
                      </tr>
                    </thead>
                    <tbody>
                      <?Php
                             if(isset($_POST['bthAllStudents']))
                              {
                                  $cou_id=$_POST['class'];
                                  $sec_id=$_POST['section'];
                                  $session_year=$_POST['session_year'];
                                  $SQL="Select * from tblstudent where cou_id='$cou_id' AND sec_id='$sec_id' AND session_year='$session_year' Order By stu_id ASC";
                                  $data=mysqli_query( $db, $SQL);
								  $sr_no=1;
                                  while($rs=mysqli_fetch_array($data))
                                  {  ?>
                      <tr>
                        <td><?Php echo $sr_no;?>
                          <?Php get_fees_status($rs['stu_id'],$session_year,date('m'));?>
                        </td>
                        <td><?Php echo $rs['stu_id'];?></td>
                        <td class="header"><?Php $rs1=get_row_con_single("tblstudent","stu_name","stu_id",$rs['stu_id']); echo $rs1['stu_name'];?></td>
                        <td class="header"><?Php $rs1=get_row_con_single("tblparents","father_name","stu_id",$rs['stu_id']); echo $rs1['father_name'];?></td>
                        <td class="header"><?Php $rs1=get_row_con_single("tblcourse","cou_name","cou_id",$rs['cou_id']); echo $rs1['cou_name']; ?></td>
                        <td class="header"><?Php $rs1=get_row_con_single("tblsection","sec_name","sec_id",$rs['sec_id']); echo $rs1['sec_name']; ?></td>
                        <td><?Php echo $rs['dob'];?></td>
                        <td>
                        <!-- <input type="checkbox" name="sel<?=$sr_no;?>" id="sel<?=$sr_no;?>" value="<?Php echo $rs['stu_id'];?>"> -->
                        <a href="javascript:printAdmitCard('<?Php echo $rs['stu_id'];?>')">Print</a>
                        </td>
                      </tr>
                      <?Php
					  $sr_no++;
                                  }
                              }
                                            ?>
                    </tbody>
                  </table>
                  <br>
                                <table border="0" cellpadding="5" align="center">
		
        <tr><td colspan="2"></td></tr>
		<!-- <tr><th id="cen"><input type="submit" name="s1" id="s1" value="Generate"></th><th id="cen">&nbsp;&nbsp;&nbsp;<input type="button" name="s2" id="s2" value="Select All" onClick="get_select(<?=$sr_no-1;?>);"></th></tr> -->
	</table>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="box box-solid">
          <div class="box-header with-border">
            <h3 class="box-title">Students Panel</h3>
            <div class="box-tools">
              <button class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i></button>
            </div>
          </div>
          <div class="box-body no-padding">
            <ul class="nav nav-pills nav-stacked">
              <li><a href="../add-student.php"><strong>Create New Student</strong></a></li>
              <li><a href="add-attendence.php"><strong>Take Student Attendance</strong></a></li>
              <li><a href="view-attendence-report.php"><strong>Student Attendance Report</strong></a></li>
              <li><a href="search-students.php"><strong>Student-Report</strong></a></li>
			  <li><a href="../view-topper.php"><strong>List Of Topper Student</strong></a></li>
		      <li><a href="list-of-absent-students.php"><strong>List-of-Absent-Students-Report</strong></a></li>
              <li><a href="all-parents.php"><strong>All Student Record</strong></a></li>
				<li><a href="marks-entery.php"><strong>Students Marks Entery</strong></a></li>
				<li><a href="marks-display.php"><strong>Result Display</strong></a></li>
				<li><a href="marks-one.php"><strong>Student&acute;s Marksheet</strong></a></li>
				<li><a href="abs-list.php"><strong>Absent List in Examination</strong></a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div style="display:none">
    <div class="starter-template">
    <table with="50%">
    <tr>
    <dt><img src="../images/logo_sc.jpeg" with="50"></dt>
    <dt>JRD School</dt>
    <dt></dt>
    </tr>
    <tr>
    <dt> </dt>
    <dt>Exam Title</dt>
    <dt></dt>
    </tr>
    </table>
        <h1>Bootstrap starter template</h1>
        <p class="lead">Use this document as a way to quickly start any new project.<br> All you get is this text and a mostly barebones HTML document.</p>
    </div>
    </div>
  </section>
</div>

<?Php include('footer.php');?>
<style type="text/css">
.listright li {
	background:#000;
	padding:5px 10px 5px 10px;
	margin:5px 5px 5px 5px;
	border-top-left-radius:12px;
	border-bottom-left-radius:12px;
}
.listright li a {
	color:#FFF;
	font-family:"Trebuchet MS", Arial, Helvetica, sans-serif;
}
</style>
<script src="../plugins/jQuery/jQuery-2.1.4.min.js" type="text/javascript"></script>
<script src="../plugins/datatables/jquery.dataTables.min.js" type="text/javascript"></script>
<script src="../plugins/datatables/dataTables.bootstrap.min.js" type="text/javascript"></script>
<script src="../dist/js/app.min.js" type="text/javascript"></script>
<script src="../plugins/sparkline/jquery.sparkline.min.js" type="text/javascript"></script>
<script src="../dist/js/demo.js" type="text/javascript"></script>
<!-- page script -->
<script type="text/javascript">
      $(function () {
        $("#example1").DataTable();
        $('#example2').DataTable({
          "paging": true,
          "lengthChange": false,
          "searching": false,
          "ordering": true,
          "info": true,
          "autoWidth": false
        });
      });
</script>
<script src="../bootstrap/js/bootstrap.min.js" type="text/javascript"></script>
<script>
function get_hide()
{
  $(".modal").removeClass("in");
  window.location.href='view-exam-type.php';
}
function get_select(b)
		{	
			for(i=1;i<=b;i++)
			{	
			eval("se=document.frm2.sel"+i);
			se.checked = true;
			}
			}	
</script>
<script>
function get_class_id(cou_id) {
	$.ajax({
	type: "POST",
	url: "ajax-functions.php",
	data:'cou_id='+cou_id,
	success: function(data){
		$("#section").append(data);
	 }
});
}
function selectsection(val) {
$("#search-box").val(val);
$("#suggesstion-box").hide();
}
</script>
<script src="../bootstrap/js/jquery.validate.js" type="text/javascript"></script>
<script type="text/javascript">
	$("#frmStudentRecords").validate({
			rules: {
				class: {
					required: true
				},
				section: {
					required: true
				},
				session_year: {
					required: true
				}
                }});	
    function printAdmitCard(studentID){
        alert(studentID);
        w=window.open();
        w.document.write(document.getElementsByClassName('starter-template')[0].innerHTML);
        w.print();
        w.close();
    }
	</script>

const HOST_URL="http://localhost:4000";
const API_URL=HOST_URL+"/posts/getAllcampaigns";
const JobType_URL=HOST_URL+"/data/metapropertiesbyid/";
const JobByCampaignId=HOST_URL+"/posts/jobsbycampaignid/";
const getjobsbycampaignid=HOST_URL+"/posts/getjobsbycampaignid/";

const PresetById=HOST_URL+"/posts/getPresetByJobs/";
const getworkflowPreset=HOST_URL+"/posts/getWorkflowPreset/";
const ScoreCardData=HOST_URL+"/posts/scorecarddata/";
const GradeModule=HOST_URL+"/posts/getgrademodule/";
const ModuleID="7388493928bc4a9aa57ca65306ed1579";
const GradeId="c0ac0a86e65f4f7ebd88dbd7e77965ef";
const CurrentStatus=[//{'text':'Workflow Preset'},

{'text':'Active'},
{'text':'NeedsChanges'},
{'text':'Overdue'},
{'text': 'Approved'},
{'text':'Closed'}];
const Presets=[
    {'text':'Permissions'},
    {'text':'Created Images'},
    {'text':'Shutterstock'},
    {'text':'Clip Art'},
];
/*const workflowPreset=[{text:'Permissions'},
{text:'Created'},
{text:'Clip Art'},
{text:'Shutterstock'}];
*/

const MetaIdJobType='262f92ed-59b1-4c3a-a74d-6877d7f8ba4c';//
import axios from 'axios';
export default{
    async getAllCompangns(){
        const res= await fetch(API_URL);
        return res.json();
    }, getCurrentStatus(){
        return CurrentStatus;
    },getworkflowPreset(){
        return workflowPreset;
    }, async getJobType(){
       const res= await fetch(JobType_URL+MetaIdJobType);
        return res.json();
    }, async getPresetByJobs(presetId){
        const preset= await fetch(PresetById +presetId);
        return preset.json();
    },async getJobByCampaignid(compId){
        console.log(JobByCampaignId +compId);
        const res= await fetch(JobByCampaignId +compId);
        return res.json();
    }/*, async getworkflowPreset(compId){
        //alert(compId);
        let data;
            await axios(getworkflowPreset + compId).then(response => {
             data= response.data //, console.log(response.data);
            });
         return data;
    } */, getPrestsGroup(){
        return Presets;
    }
    , async getjobsbycampaignid( obj  ){
        debugger
      let data;
            await axios.post(getjobsbycampaignid, obj).then(response => {
             data= response.data //, console.log(response.data);
            });
         return data;
          //const res= await fetch(getjobsbycampaignid +obj.campaignID );
        //return res.json();
       // let promise = new Promise(function(resolve, reject) {
            // executor (the producing code, "singer")
          
      //  });
        //return res.json();
       /* .then((response) => response.json())
      .then((response) => {
        console.log('fetch-promise resolution');
        console.log(response.json);
        return response.json();
      })
      .then((responseData) => {
        console.log('response.json-promise resolution');
        // this.setState({
        //   dataSource: this.state.dataSource.cloneWithRows(responseData.movies),
        //   loaded: true,
        // });
      })
      .done();
     */
    }, async getScoreCardData(obj){
        let data;
            await axios.get(ScoreCardData , obj).then(response => {
             data= response.data //, console.log(response.data);
            });
         return data;
    }, async getGrade(){
            const res= await fetch(GradeModule+ GradeId);
            return res.json();
    }, async getModule(){
        const res= await fetch(GradeModule+ ModuleID);
        return res.json();
    }
};

//https://greatminds.getbynder.com/api/workflow/metaproperties/262f92ed-59b1-4c3a-a74d-6877d7f8ba4c

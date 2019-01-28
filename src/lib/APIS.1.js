const API_URL="http://localhost:4000/posts/Retrieve_all_campaigns";
const JobType_URL="http://localhost:4000/data/metapropertiesbyid/";
const JobByCampaignId="http://localhost:4000/posts/jobsbycampaignid/";
const getjobsbycampaignid="http://localhost:4000/posts/getjobsbycampaignid/";
const PresetById="http://localhost:4000/posts/getPresetByJobs/";
const CurrentStatus=[//{'text':'Workflow Preset'},
{'text':'Active'},
{'text':'Coming up'},
{'text':'Overdue'},
{'text': 'Approved'},
{'text':'Closed'}];
const workflowPreset=[{text:'Permissions'},
{text:'Created'},
{text:'Clip Art'},
{text:'Shutterstock'}];

const MetaIdJobType='262f92ed-59b1-4c3a-a74d-6877d7f8ba4c';//

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
    }, async getjobsbycampaignid( obj  ){
       const res= await fetch(getjobsbycampaignid +obj.campaignID );
        return res.json();

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
    }
};

//https://greatminds.getbynder.com/api/workflow/metaproperties/262f92ed-59b1-4c3a-a74d-6877d7f8ba4c

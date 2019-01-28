var appConfig = { 
   request_data :{
    url: `` ,
    method: 'GET',
    data: { status: 'Hello Ladies + Gentlemen, a signed OAuth request!' }
  },consumer: {
    key: '71BEFFCC-2CC9-476D-93A8A79BB92BD87B',
    secret: 'a8de7d89165b8234405b35c83553a318'
  },token : {
    key: 'E07A70F7-4145-44D6-AC53C771E792A609',
    secret: '2a044b35eebcb94d315b77f02a31a86b'
  },
  apiAction:  [
      { action: 'jobsbycampaignid', URL:`https://greatminds.getbynder.com/api/workflow/campaigns/`, extraConfog: true, other:`/jobs`},
      { action: 'getPresetByJobs', URL:'https://greatminds.getbynder.com/api/workflow/presets/job/', extraConfog: true, other:''},
      { action: 'users', URL:'https://greatminds.getbynder.com/api/workflow/users/', extraConfog: false, other:''},
      { action: 'metapropertiesbyid', URL:'https://greatminds.getbynder.com/api/workflow/metaproperties/', extraConfog: true, other:''},
      { action: 'test4', URL:'', extraConfog: false, other:''}
], getActionInfo (name, id) { // same as "sayHi: function()"
        var data=this.apiAction.filter(function(data) {
            return data.action == name;
        }); 
        //console.log("data return is",data, "extraConfig is", data[0].extraConfog, "id is ", id ); 
        if(data[0].extraConfog==true){
            this.request_data.url= data[0].URL + id + data[0].other;
         }else{
            this.request_data.url=data[0].URL;
         }
         console.log(this.request_data);
        return this.request_data;
    },
    getConsumer(){
        return this.consumer;
    },
    getToken(){
        return this.token;
    }
};
module.exports = appConfig;

//appConfig.sayHi(111);

/*, getRequestData : function(name, para){
    console.log(name, para);
        // this.request_data.url=this.getAction();
        // var marvelHeroes =  this.request_data.filter(function(data) {
        //     return data.action == name;
        // });
        // console.log(marvelHeroes);
        
    }
*/
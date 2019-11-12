const express = require('express');
const app = express();
const path = require('path'); 
const bodyParser = require('body-parser');
const PORT = 4000;
const cors = require('cors');
const request = require('request');
const OAuth   = require('oauth-1.0a');
const crypto  = require('crypto');

const mongoose = require('mongoose');
const config = require('./DB.js');
const postRoute = require('./post.route');
const scoreCard = require('./scoreCard');
const dataRoute = require('./postapis.route');
const test = require('./test');
require('log-timestamp');

mongoose.Promise = global.Promise;
 const option = {
  useNewUrlParser: true,
  socketTimeoutMS: 30000,
  keepAlive: true,
  reconnectTries: 30000
};
mongoose.Promise = global.Promise;
mongoose.connect(config.DB, option).then(() => { console.log('Database is connected') }, 
  err => { console.log('Can not connect to the database'+ err)}
);

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/posts', postRoute);
app.use('/scoreCard', scoreCard);
app.use('/data', dataRoute);
app.use('/test', test);
///
//app.use('/static', express.static(path.join(__dirname,"/public/dist/static/")));
//app.get('/', function(req,res) {
 // res.sendFile('index.html', { root: path.join(__dirname, '/public/dist/') });
//});
// const publicRoot = '/mnt/Grate-mind/bynder/dist';
// app.use(express.static(publicRoot));

// app.get("/*", (req, res, next) => {
//   res.sendFile("index.html", { root: publicRoot });
// });
app.listen(PORT, function(){
  console.log('Server is running on Port:',PORT);
});

//app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
process.on('uncaughtException', function (exception) {
  console.log("AppErr:", exception);
});
 

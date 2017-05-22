var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


// require hogan
var hogan = require("hogan.js");
// construct template string
var template = hogan.compile("@{{index}}");
// compile template
var hello = hogan.compile(template);


var router = express.Router();

//init app
var app = express();
/*-----------------------------------------*/

var fnHelper = require('./model/Helper');
var twConfig = require('./config/twitterConfig');

const NodeCache = require( "node-cache" );
app.locals.tweetsCache = new NodeCache();

var Twitter = require('twitter');
var twitter = new Twitter(twConfig);
const twRateLimit = (15 * 60) / 180;

var setCache = function(key, content){
  app.locals.tweetsCache.set(key, content, function( err, success ){
    if( !err && success ){
      console.log( 'Tweets cached successfully for:',key);
    } else {
       console.log( 'Cache error:', err );
    }
  });
}

//Pull & cache tweets
var twError = function(user, err) {
	console.log('ERROR [%s]', JSON.stringify(err));

	var tweets = fnHelper.readTweetsFile(user+'_data.json');

	console.log('Read Tweets from file: ', user, ', received -', typeof tweets);
  setCache(user, tweets);
};

var twSuccess = function(user, tweets) {

  var tweets = typeof tweets === 'object' ? tweets : JSON.parse(tweets);

  tweets.forEach(function callback(tweet) {
    tweet['created_at_formatted'] = fnHelper.tweetDateNormalized( tweet.created_at );
    tweet['created_at_ms'] = fnHelper.tweetDateMilliseconds( tweet.created_at );
  });

  setCache(user, tweets);
  fnHelper.writeTweetsFile(user+'_data.json', tweets);
};

if( typeof app.locals.tweetsCache.get('tweetLastRequest') === 'undefined'
  || Date.now() - twRateLimit > app.locals.tweetsCache.get('tweetLastRequest') ) {

  var users = fnHelper.users;

  users.forEach((user, index, array) => {
    var params = { screen_name: user, count: 30, page: 1};

    twitter.get('statuses/user_timeline', params, function(error, tweets, response) {
      if (!error) {
        twSuccess(user, tweets);
      } else {
        console.log('request failed:',error, response);
        twError(user, error);
      }
    });

  });

  app.locals.tweetsCache.set('tweetLastRequest', Date.now());

} else {
  fnHelper.readTweetsFile();
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); //allow to perform post request

app.use(cookieParser());

//use generated files in public folder
app.use(express.static(path.join(__dirname, 'public')));

//load constollers (router*)
app.use(require('./controllers'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

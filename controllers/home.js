var express = require('express');
var router = express.Router();
var fnHelper = require('../model/Helper');

router.get('/', function(req, res, next) {

  var tweetsCache = req.app.locals.tweetsCache;
  var users = fnHelper.users;
  var data = [];

  users.forEach((user, index, array) => {
    var twData = {};

    tweetsCache.get( user,  function( err, value ){
      if( !err ){
        if(value == undefined){
          console.log('key not found: ', user);
        } else {
          console.log('tweets retrieved for:', user , 'data type',typeof value);

          twData.id = user;
          twData.tweets = typeof value === 'object' ? value : JSON.parse(value);
          data.push(twData);
        }
      } else {
        console.log( 'Cache error:', err );
      }
    });

  });

  console.log( 'result  :', data );


  //temporary chubby resp
  res.render('index', {
      title:      'Dev Test Twitter REST API',
      pagetitle: 'Dev Test Index POST',
      partials: {
          menu:         'menu',
          feed_options: 'feed_options',
          tweet:        'tweet',
          footer:       'footer'
      },
      data: data
  });

});


router.post('/', function(req, res, next) {

    res.render('index', {
        title: 'Test Home page for POST request',
        pagetitle: 'Test Index POST',
    });
});

module.exports = router;

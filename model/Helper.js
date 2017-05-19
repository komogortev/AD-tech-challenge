var dateOptions = {year: 'numeric', month: 'short', day: 'numeric'};
var timeOptions = {hour: 'numeric', minute : 'numeric'};

module.exports = {

  users: ["laughingsquid", "techcrunch", "appdirect"],

  tweetDateNormalized: function parseTwitterDate(twitterDate) {

    var formattedDate = new Date(Date.parse(twitterDate)).toLocaleString('en-US', dateOptions )
      .replace(/([a-zA-Z]+) (\d{1,2}\,)/, '$2 $1').replace(',','');
    var formattedTime = new Date(Date.parse(twitterDate)).toLocaleString('en-US', timeOptions );

    return formattedTime + ', ' + formattedDate;
  },

  tweetDateMilliseconds: function convertDateMilliseconds(twitterDate) {

    return new Date(twitterDate).getTime();
  },

  writeTweetsFile: function writeFile(filename, content) {
    var fs = require('fs');

    if (!fs.existsSync('./data/'+filename)){
      var fd = fs.openSync('./data/'+filename, 'w');
    }

    fs.writeFile('./data/'+filename, JSON.stringify(content), 'utf8');
  },

  readTweetsFile: function readFile(filename) {
    var fs = require('fs');

    if (!fs.existsSync('./data/'+filename)){
      return 'file not found';
    }

    try {
        return JSON.parse(fs.readFileSync('./data/'+filename, 'utf8'));
    } catch (err) {
        console.error(err);
    }
  }

};


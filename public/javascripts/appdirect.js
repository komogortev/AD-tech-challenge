/* global Store:true */
/* global localStorage */

Store = {

  isAvailable: function checkLocalStorageStatus() {
    var test = 'test';
    try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch(e) {
      return false;
    }

  },

  dataEncode: function keyEncode(data) {
      return JSON.stringify(data);
  },

  dataDecode: function keyDecode(data) {
    try {
      data = JSON.parse(data);
    }
    catch (error) {
      data = null;
    }
    return data;
  },

  set: function setStoreKey(key, data, type) {
    if (Store.isAvailable) {


      return localStorage.setItem(key, Store.dataEncode({
          type: type || 'settings',
          data: data
      }));

    }
  },

  get: function getStoreKey(key) {
    if (Store.isAvailable) {
      var lsValue = Store.dataDecode(localStorage.getItem(key));

      if (lsValue !== null && lsValue.hasOwnProperty('data')) {
          return lsValue.data;
      }

      return null;
    }
  },

  reset: function removeStoreKey(key) {
    if (Store.isAvailable) {
      return localStorage.removeItem(key);
    }
  }


};

Store.readSettings = function storeReadSettings(key) {
  return Store.get(key);
};

Store.writeSettings = function storeWriteSettings(key, data) {
  return Store.set(key, data);
};;/* global $ */
/* global Core:true */
/* global Store */
/* global location */

Core = {

  params: {
    storageSettingsKey : 'pageSettings',
    pageSettingsCollection : '',
  },

  init: function coreInit() {
    'use strict';

    Core.params.pageSettingsCollection = Store.readSettings(Core.params.storageSettingsKey);

    Core.initSettings();

    Core.listenSettings();

    Core.handleDrag();

    Core.handleToggle();

  },

};

Core.handleDrag = function coreHandleDrag(){
  var dragged;

  $(document).on("dragstart", function( event ) {
      $('.js-drop-box').addClass('drag-on');
      dragged = event.target;
      $(dragged).addClass('in-transit');
  });

  $(document).bind("dragover", function( event ) {
      event.preventDefault();
  });

  $(document).on("drop", function( event ) {
      event.preventDefault();
      $('.js-drop-box').removeClass('drag-on');
      $(dragged).removeClass('in-transit');
      var donor = $(dragged).closest('.js-drop-box');
      var recipient = $(event.target).closest('.js-drop-box');
      var replacement = $(event.target).closest('.js-drop-box').find('.js-drag-box');

      donor.remove('.js-drag-box').append(replacement);
      recipient.remove('.js-drag-box').append( dragged );
  });
};

Core.handleToggle = function coreHandleToggle() {

  $('.js-toggle').off('click').on('click', function toggleTarget() {

    var $target = $($(this).data('target'));

    if ($target.hasClass('is-active')) {
      $target.removeClass('is-active');
    } else {
      $target.addClass('is-active');
    }

  });

};

Core.sortUsers = function coreSortUsers(order) {
  //having given 3 user feeds is required amount at all times
  //otherwise dynamic assigning in loop through the children required
  var userFeeds = $('.user-feed').find('.js-drop-box');

  switch (order) {
    case 'order-asc':

      userFeeds.each(function(index){
        $(this).css('order', index + 1);
      });

      break;
    case 'order-desc':

      userFeeds.each(function(index){
        $(this).css('order', userFeeds.length - index);
        console.log(userFeeds.length - index);
      });

      break;
    case 'order-mix':

      for(var i, tmpArr=[i=1]; i<userFeeds.length;tmpArr[i++]=parseInt(Math.random() * i));
      userFeeds.each(function(index){
        $(this).css('order', tmpArr[index]);
      });
      break;

    default:
      return false;
    //break;
  }

};

Core.resetSettings = function coreResetSettings() {

  var attemtToReset = new Promise( function(resolve, reject) {
    resolve( Store.reset(Core.params.storageSettingsKey) );
  });

  attemtToReset.then(function(){
    location.reload();
  });

  //uglifier does not allow es6 heresy :(
  // let attemtToReset = new Promise((resolve, reject) => {
  //   resolve(Store.reset(Core.params.storageSettingsKey));
  // });

  // attemtToReset.then(() => {
  //   location.reload();
  // });

};

Core.switchClassTrigger = function coreSwitchClassTrigger(prefix, settingClass) {
  var pattern = '(^|\\s)' + prefix + '\\S+';
  var regexKey = new RegExp(pattern,'g');

  $('body')[0].className = $('body')[0].className.replace(regexKey, '');
  $('body').addClass(settingClass);
};

Core.updateClassCollection = function coreUpdateClassCollection(settingClass) {

  var settingPrefix = settingClass.split('-')[0];

  if (typeof settingClass === 'undefined') {
    return;
  }

  switch (settingPrefix){
    case 'order':
      Core.sortUsers(settingClass);
    break;
    case 'theme':
      $('link[rel=stylesheet][href*="' + settingPrefix + '"]').remove();
      $('<link/>', {rel: 'stylesheet', href: 'stylesheets/'+ settingClass + '.css'}).appendTo('head');
      break;
    case 'reset':
      Core.resetSettings();
      return false;
    //break;
  }

  Core.switchClassTrigger(settingPrefix, settingClass);

  Core.params.pageSettingsCollection = $('body')[0].className;
  Store.writeSettings(Core.params.storageSettingsKey,Core.params.pageSettingsCollection);
};

Core.listenSettings = function coreListenSettings() {

  $('.js-settings').off('click').on('click.layoutSwitch',  function(){
    Core.updateClassCollection($(this).data('option'));
  });

};

Core.initSettings = function coreInitSettings() {
    $('body').addClass(Core.params.pageSettingsCollection);
};

Core.init();;/*global $ */
/*global Filter:true */
/*global Store */
/*global DateFilter */
/*global AmountFilter */
/*global wNumb*/
/*global noUiSlider*/

Filter = {

  types: ['.js-date-filter','.js-amount-filter'],

  params: {
    storageSettingsKey : 'filterSettings',
    filterSettingsCollection : {
      filterId :  'start',
    },

  },

  init: function filtersInit(){
    'use strict';

    Filter.params.filterSettingsCollection = Store.readSettings(Filter.params.storageSettingsKey) === null ?
      {} : Store.readSettings(Filter.params.storageSettingsKey);

    Filter.initFilters();

  },

  dateOptions : {year: 'numeric', month: 'short', day: 'numeric'},

  timeOptions : {hour: 'numeric', minute : 'numeric'},

  timestamp: function timestamp(str){
    return new Date(str).getTime();
  },

};

/*Switch to dynamic min/max calculation for mixed date feed
  to lose another couple of hours on debugin if you want*/
// Filter.getStartEndDate = function filterGetStartEndDate(el){
//   var tweets = $(el).closest('ol.tweets-feed').find('time');
//   var min, max;
//   min =  max = Filter.timestamp($(tweets[0]).data('original'));
//   for (var i in tweets) {
//     var current = tweets[i].dateTime;
//     min = current < min ? current : min;
//     max = current > max ? current : max;
//   }
//   return {'startDate': min, 'endDate':max};
// }

Filter.findStoredFilter = function filterfindStoredFilter(filterId){
  return Filter.params.filterSettingsCollection[filterId] !== null ?
    Filter.params.filterSettingsCollection[filterId] : false;
};

Filter.updateFilterCollection = function filterUpdateFilterCollection(filterId, options) {

  if (typeof filterId === 'undefined') {
    return;
  }

  Filter.params.filterSettingsCollection[filterId] = options;
  Store.writeSettings(Filter.params.storageSettingsKey, Filter.params.filterSettingsCollection);

};

Filter.bildOptions = function filterBildOptions(el){

  var options = {};
  var elemId = $(el).attr('id');
  var storedSettings = Filter.findStoredFilter(elemId);

  var range = {'min': 0,'max': 30};
  options.step = 1;
  //options['padding'] = 4;
  var isDate = el.data('type') === 'date' ? true : false;

  if(isDate){

    var maxD = Filter.timestamp($(el).closest('ol.tweets-feed').find('li.tweet-box').first().find('time').data('original'));
    var minD = Filter.timestamp($(el).closest('ol.tweets-feed').find('li.tweet-box').last().find('time').data('original'));

    options.type =  'date';
    options.start = storedSettings ? storedSettings : [minD, maxD];
    options.connect = true;
    options.format = wNumb({decimals: 0});
    options.step = (maxD - minD) / 10;
    options.range = {
      min: minD,
      max: maxD,
    };

  } else {

    options.type =  'amount';
    options.start =  storedSettings ? parseFloat(storedSettings) : 100;
    options.connect = [true, false];
    options.tooltips = wNumb({ decimals: 0 });
    options.range = {
      min: 0,
      max: $(el).closest('ol.tweets-feed').find('li.tweet-box').length
    };

  }

  return {elemId: elemId, options: options};

};

Filter.signTooltip = function filterSignTooltip(elemId, options){

  var $tooltip = $('#'+elemId).closest('ol.tweets-feed')
    .find('.js-'+options.type+'-tooltip');

  var tooptipValue = options.type == 'date' ?
   Filter.normalizeDate(options.start[0])+' - '+Filter.normalizeDate(options.start[1]):
   options.start;

  $tooltip.html(tooptipValue);

};

Filter.create = function filterCreate(id, options){

  var filterId = document.getElementById(id);

  noUiSlider.create(filterId,options)
    .on('set.sliderFilter',  function(values, handle){
      Filter.handleChange(this, values, handle);
    });

  filterId.noUiSlider.set(options.start);

};

Filter.findInstances = function filterFindInstances(target){ return $(target); };

Filter.initFilter = function filterInitFilter(filterType){

  var filterCollection = Filter.findInstances(filterType);

  filterCollection.each(function() {

    Promise.resolve(Filter.bildOptions($(this))).then(function(result) {

      Filter.create(result.elemId, result.options);
      Filter.signTooltip(result.elemId, result.options);

    }).catch(function (error) {
      console.log(error);
    });

  });

};

Filter.initFilters = function filterInitFilters(){

  var filterList = Array.from(Filter.types);

  filterList.forEach(function(item){
     Filter.initFilter(item);
  });

};

Filter.normalizeDate = function filterNormalizeDate(milliseconds) {

  var formattedDate = new Date(parseInt(milliseconds)).toLocaleString('en-US', Filter.dateOptions )
      .replace(/([a-zA-Z]+) (\d{1,2}\,)/, '$2 $1').replace(',','');
  var formattedTime = new Date(parseInt(milliseconds)).toLocaleString('en-US', Filter.timeOptions );

  return formattedTime + ', ' + formattedDate;

};

Filter.updateFeedView = function filterUpdateFeedView(parentFeed, selector){

  parentFeed.find('li.tweet-box').show();
  parentFeed.find(selector).hide();

};

Filter.findLimitsIndex = function filterfindLimitsIndex(parentFeed, dateLimits){

  var lowerLimit = dateLimits[0],
      upperLimit = dateLimits[1],
      lowerIndex = null,
      upperIndex = null;

  $(parentFeed).children('.tweet-box').each(function(index){

    if (lowerIndex === null && $(this).data('ms-range') < lowerLimit){
       lowerIndex = index;
    }
    if ( upperIndex === null && $(this).data('ms-range') < upperLimit){
       upperIndex = index;
    }
    if (upperIndex !== null && lowerIndex !== null) return false;

  });

  return 'li.tweet-box:nth-child(-n+' + (upperIndex)  + '):nth-child(n+' + (lowerIndex)  + ')';

};

Filter.handleChange = function filterHandleChange(elem, values, handle){

  var newValue = typeof values[handle] === 'undefined' ? values : values[handle],
    type = $(elem.target).data('type'),
    parentFeed = $(elem.target).closest('ol.tweets-feed'),
    displayBox = parentFeed.find('.js-'+type+'-tooltip'),
    zeroNstartAdjust = 2,
    amountShown = parseFloat(newValue),
    amountSelector = 'li.tweet-box:nth-child(n+' + (amountShown + zeroNstartAdjust)  + '):visible',
    lowerDate, upperDate;

  if(type === 'date'){
    lowerDate = Filter.normalizeDate(values[0]);
    upperDate = Filter.normalizeDate(values[1]);
    //$(parentFeed).find(Filter.findLimitsIndex(parentFeed, values)).hide();
  }

  Filter.updateFeedView(parentFeed, amountSelector);
  Filter.updateFilterCollection($(elem.target).attr('id') , values);
  $(displayBox).html(type === 'date' ? lowerDate + ' - ' + upperDate : amountShown);

};

Filter.init();
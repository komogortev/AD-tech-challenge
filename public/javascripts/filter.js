/*global $ */
/*global Filter */
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

    Filter.params.filterSettingsCollection = Store.readSettings(Filter.params.storageSettingsKey) === null ?
      {} : Store.readSettings(Filter.params.storageSettingsKey);

    Filter.initFilters();

    Filter.updateFilters();

  },

  dateOptions : {year: 'numeric', month: 'short', day: 'numeric'},

  timeOptions : {hour: 'numeric', minute : 'numeric'},

  timestamp: function timestamp(str){
    return new Date(str).getTime();
  },

}

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
}

Filter.updateFilters = function filterUpdateFilters(){

}

Filter.updateFilterCollection = function filterUpdateFilterCollection(filterId, options) {

  if (typeof filterId === 'undefined') {
    return;
  }

  Filter.params.filterSettingsCollection[filterId] = options;
  Store.writeSettings(Filter.params.storageSettingsKey, Filter.params.filterSettingsCollection);

}


Filter.bildOptions = function filterBildOptions(el){

  var options = {};
  var elemId = $(el).attr('id');
  var storedSettings = Filter.findStoredFilter(elemId);

  var range = {'min': 0,'max': 30};
  options['step'] = 1;
  //options['padding'] = 4;
  var isDate = el.data('type') === 'date' ? true : false;

  if(isDate){

    var maxD = Filter.timestamp($(el).closest('ol.tweets-feed').find('li.tweet-box').first().find('time').data('original'));
    var minD = Filter.timestamp($(el).closest('ol.tweets-feed').find('li.tweet-box').last().find('time').data('original'));

    options['type'] =  'date';
    options['start'] = storedSettings ? storedSettings : [minD, maxD];
    options['connect'] = true;
    options['format'] = wNumb({decimals: 0});
    options['step'] = (maxD - minD) / 10;
    options['range'] = {
      min: minD,
      max: maxD,
    };

    return {elemId,options};

  } else {

    options['type'] =  'amount';
    options['start'] =  storedSettings ? parseFloat(storedSettings) : 100;
    options['connect'] = [true, false];
    tooltips: wNumb({ decimals: 0 }),
    options['range'] = {
      min: 0,
      max: $(el).closest('ol.tweets-feed').find('li.tweet-box').length
    };

    return {elemId,options};
  }

}

Filter.signTooltip = function filterSignTooltip(elemId, options){
  var $tooltip = $('#'+elemId).closest('ol.tweets-feed')
    .find('.js-'+options.type+'-tooltip');
  var tooptipValue = options.type == 'date' ?
   Filter.normalizeDate(options.start[0])+' - '+Filter.normalizeDate(options.start[1]):
   options.start;

  $tooltip.html(tooptipValue);
}

Filter.create = function filterCreate(id, options){
  var filterId = document.getElementById(id);
  noUiSlider.create(filterId,options)
    .on('set.sliderFilter',  function(values, handle){
      Filter.handleChange(this, values, handle);
    });
    filterId.noUiSlider.set(options.start);
}

Filter.findInstances = function filterFindInstances(target){
  return $(target);
}

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

}

Filter.initFilters = function filterInitFilters(){

  var filterList = Array.from(Filter.types);

  filterList.forEach(function(item){
     Filter.initFilter(item);
  });

}



Filter.normalizeDate = function filterNormalizeDate(milliseconds) {
 var formattedDate = new Date(parseInt(milliseconds)).toLocaleString('en-US', Filter.dateOptions )
      .replace(/([a-zA-Z]+) (\d{1,2}\,)/, '$2 $1').replace(',','');
    var formattedTime = new Date(parseInt(milliseconds)).toLocaleString('en-US', Filter.timeOptions );

    return formattedTime + ', ' + formattedDate;
}

Filter.updateFeedView = function filterUpdateFeedView(parentFeed, selector){
  parentFeed.find('li.tweet-box').show();
  parentFeed.find(selector).hide();
}

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
}

Filter.handleChange = function filterHandleChange(elem, values, handle){

  var newValue = typeof values[handle] === 'undefined' ? values : values[handle],
    type = $(elem.target).data('type'),
    parentFeed = $(elem.target).closest('ol.tweets-feed'),
    displayBox = parentFeed.find('.js-'+type+'-tooltip'),
    zeroNstartAdjust = 2,
    amountShown = tooptipValue = parseFloat(newValue),
    amountSelector = 'li.tweet-box:nth-child(n+' + (amountShown + zeroNstartAdjust)  + '):visible';

  if(type ==='date'){
    var lowerDate = Filter.normalizeDate(values[0]),
        upperDate = Filter.normalizeDate(values[1]),
        tooptipValue = lowerDate + ' - ' + upperDate;
    //console.log(Filter.findLimitsIndex(parentFeed, values));
     //$(parentFeed).find(Filter.findLimitsIndex(parentFeed, values)).hide();

  }

  Filter.updateFeedView(parentFeed, amountSelector);
  Filter.updateFilterCollection($(elem.target).attr('id') , values);
  $(displayBox).html(tooptipValue);

}

Filter.init();
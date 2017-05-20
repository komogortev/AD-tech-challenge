/* global $ */
/* global Core */
/* global Store */
/* global location */

Core = {

  params: {
    storageSettingsKey : 'pageSettings',
    pageSettingsCollection : '',
  },

  init: function coreInit() {

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
}

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
  var userFeeds = $('.user-feed').find('.js-feed-container');


  switch (order) {
    case 'order-asc':

      userFeeds.each(function(index){
        $(this).css('order', index + 1);
      });

      break;
    case 'order-desc':

      userFeeds.each(function(index){
        $(this).css('order', userFeeds.length - index);
        console.log(userFeeds.length - index)
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
    break;
  }

}

Core.resetSettings = function coreResetSettings() {

  let attemtToReset = new Promise((resolve, reject) => {
    resolve(Store.reset(Core.params.storageSettingsKey));
  });

  attemtToReset.then(() => {
    location.reload();
  });

};

Core.switchClassTrigger = function coreSwitchClassTrigger(prefix, settingClass) {
  var pattern = '(^|\\s)' + prefix + '\\S+';
  var regexKey = new RegExp(pattern,'g');

  $('body')[0].className = $('body')[0].className.replace(regexKey, '');
  $('body').addClass(settingClass);
}

Core.updateClassCollection = function coreUpdateClassCollection(settingClass) {

  var settingPrefix = settingClass.split('-')[0];

  if (typeof settingClass === 'undefined') {
    return;
  }

  switch (settingPrefix){
    case 'order': case 'order': case 'order':
      Core.sortUsers(settingClass);
    break;
    case 'reset':
      Core.resetSettings();
      return false;
    break;
  }

  Core.switchClassTrigger(settingPrefix, settingClass);

  Core.params.pageSettingsCollection = $('body')[0].className
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

Core.init();
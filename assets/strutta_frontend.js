Drupal.behaviors.ieWarning = function(context) {
  $('#ie6-message:not(.ie6-processed)').each(function() {
    var w = $(this).addClass('ie6-processed');
    $(this).find('.close').click(function(){
      w.slideUp('fast', function(){
        $.cookie('ie6_close', 1);
        w.remove();
      });
      return false;
    });
  });
};

Drupal.behaviors.iframeResize = function(context) {
  $('body:not(.iframe-resize-processed)').each(function() {
    $(this).addClass('iframe-resize-processed');
    if (Drupal.settings.iframed && window.location != top.location && window.postMessage) {
      parent.postMessage('path=' + window.location.pathname, '*');
      setInterval(function() {
        var offset = $('#measure').offset();
        parent.postMessage('height=' + offset.top, '*');
      }, 100);
    }
  });
};

Drupal.behaviors.canvasDebug = function(context) {
  try {
    if ($('html').hasClass('display-facebook') && (window == top)) {
      $('html').css('overflow', 'auto');
    }
  } catch (e) {}
};

// Display rules in popup during entry flow
Drupal.behaviors.rulesPopup = function () {
  $('.rules-popup:not(.rules-popup-processed)').each(function() {
    $(this).addClass('rules-popup-processed').click(function() {
      $.modal(Drupal.settings.officialRules, {
        title: Drupal.settings.officialRulesTitle,
        width: "40%",
        height: 350,
        draggable: false,
        resizable: false,
        dialogClass: 'rules-lightbox'
      });
      return false;
    });
  });
};

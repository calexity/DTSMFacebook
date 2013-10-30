Drupal.behaviors.resizeParentFrame = function(context) {
  if (!Drupal.settings.published && !Drupal.settings.isMini && (Drupal.settings.facebookIsTab || Drupal.settings.facebookIsCanvas)) {
    $('body:not(.resize-parent-processed)').each(function(){
      var $body = $(this).addClass('resize-parent-processed');
      if (parent.document) {
        var $frame = $(parent.document.getElementById('preview-frame'));
        if ($frame.length && window != top) {
          setInterval(function() {
            var h = $('#measure').offset().top;
            $frame.attr('height', h).css({height:h});
          }, 100);
        }
      }
    });
  }
};

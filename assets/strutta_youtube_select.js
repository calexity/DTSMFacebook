var youtubeAuthPopup = null;

Drupal.behaviors.youtubeSelectInit = function(context) {
  $('.youtube-select-init:not(.youtube-processed)').each(function(){
    var $that = $(this).addClass('youtube-processed');
    $that.click(function() {
      youtubeAuthPopup = open(this.href, 'google_oauth', 'width=700,height=460');
      return false;
    });
  });
};

Drupal.behaviors.youtubeListenMessage = function(context) {
  $('body:not(.youtube-message-processed)').each(function(){
    $(this).addClass('youtube-message-processed');
    $(window).bind('message', function(e) {
      var d = e.originalEvent.data;
      if (typeof d == 'object' && d.code) {
        youtubeAuthPopup.close();
        $.get('/youtube-select/oauth/complete', {code: d.code}, function(result) {
          $('#edit-youtube-contents-refresh').val(1).change();
        });
      }
    });
  });
};
$.fn.zoomy = function(img, largeSrc, complete, opts) {

  opts = opts || {};

  var $img = $(img), $trigger = $(this);

  var image = new Image();
  image.onload = function() {

    var open = false;
    if (opts && opts.load) opts.load();

    $trigger.click(function(){

      if ($.fn.zoomy.last == this) {
        remove();
        return false;
      }
      $.fn.zoomy.last = this;

      $('.zoomy-large').remove();

      var o = $img.offset();

      opts = $.extend({
        width: $img.width(),
        height: $img.height(),
        top: o.top,
        left: o.left,
        largeWidth: image.width,
        largeHeight: image.height,
        fade: false
      }, opts);

      opts = $.extend({
        largeTop: $(window).scrollTop() + ($(window).height() / 2) - (opts.largeHeight / 2),
        largeLeft: ($(document).width()) / 2 - opts.largeWidth / 2
      }, opts);

      // Handle largeTop pushing the close button offscreen
      if (opts.largeTop < 25) {
        opts.largeTop = 25;
      }

      function remove() {
        $.fn.zoomy.last = null;
        $('.zoomy-large .close-button').remove();
        $('.zoomy-large').removeClass('zoomy-large-complete').animate({
          width: opts.width,
          height: opts.height,
          top: opts.top,
          left: opts.left,
          opacity: opts.fade ? 0 : 1
        }, 250, function(){
          $('.zoomy-large').remove();
        });
      }

      if ($('.zoomy-large').length > 0) {
        remove();
        return false;
      }

      var $protect = $('<div class="copy-protect">');

      var $wrapper = $('<div class="zoomy-wrapper">').append(image).append($protect);

      $('body').append($('<div class="zoomy-large">').html($wrapper));

      $('.zoomy-large').css({
        width: opts.width,
        height: opts.height,
        display: 'block',
        top: opts.top,
        left: opts.left,
        opacity: opts.fade ? 0 : 1
      }).animate({
        width: opts.largeWidth,
        height: opts.largeHeight,
        top: opts.largeTop,
        left: opts.largeLeft,
        opacity: 1
      }, 200, function(){
        $('.zoomy-large').addClass('zoomy-large-complete');
        $('.zoomy-wrapper').append($('<div class="close-button">').css({display: 'none'}));
        $('.zoomy-wrapper .close-button').fadeIn();
        $('.zoomy-large *').click(function(){
          remove();
        });
        if ($.isFunction(complete)) {
          complete();
        }
      });
      return false;
    });
  };

  image.src = largeSrc;

  return image;
};

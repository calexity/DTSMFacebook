/**
 *
 *  @file
 *  Share Tool JS layer.
 *
 */

var Strutta = Strutta || {};

Strutta.share = Strutta.share || {};

Strutta.share.dialog = function(entryId) {
  $.get(['/share/dialog', entryId].join('/'), function(html) {
    $.modal(html, {
      title: 'Share your entry with your friends!',
      width: 600,
      height: 300
    });
  });
};

Strutta.share.open = function(service, url) {
  var m = Drupal.settings.sharing;
  var e = Drupal.settings.currentEntry || 0;
  Strutta.share.trigger('before', service, e);

  switch (service) {
    case 'mail':
      $('.share-email-form').slideToggle();
      break;
    case 'facebook':
      var opts = {
        method: 'feed',
        link: url,
        description: m.description,
        caption: m.caption,
        picture: m.picture
      };

      // DEPRACATED
      // To do: remove once no more custom domain microsites are running promos app
      if (Drupal.settings.shareFacebookRedirect) {
        opts.next = Drupal.settings.shareCloseUrl;
      }
      // No response given when new fb share window opens, so record here.
      if (Drupal.settings.isCustomDomain) {
        Strutta.share.trigger('after', service, e);
      }
      // END DEPRACATED

      FB.ui(opts, function(response) {
        if (response !== null) Strutta.share.trigger('after', service, e);
      });
      break;
    default:
      var width  = 600;
      var height = 350;
      var left   = (window.outerWidth / 2) - (width / 2);
      var top    = (window.outerHeight / 2) - (height / 2);
      window.open(url, '_blank', 'width='+ width +', height='+ height +', top='+ top +', left='+ left +', scrollbars=1');
      Strutta.share.trigger('after', service, e);
      break;
  }
};

/**
 *  Behavior to process shareTool instances.
 */
Drupal.behaviors.shareTool = function() {
  $('.share-tool-services a:not(.share-tool-processed)').each(function() {
    $link = $(this).addClass('share-tool-processed');
    $link.click(function() {
      var service = $(this).data('service');
      var url = $(this).data('url');
      Strutta.share.open(service, url);
      return false;
    });
  });
};

// Lists of events that can be executed before or after share events
Strutta.share = $.extend(Strutta.share, {
  before: [],
  after:  [],
  trigger: function(t, s, e) {
    $.each(Strutta.share[t], function(i) {
      this(s, e);
    });
  }
});

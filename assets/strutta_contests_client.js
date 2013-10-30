
function vote(nid, val, callback) {
  var redirect = window.location.pathname;

  if (Drupal.settings.userId < 1 && Drupal.settings.voteRequiresLogin) {
    $.cookie('pending_vote', nid + ':' + val);
    if (Drupal.settings.facebookIsCanvas || Drupal.settings.facebookIsTab) {
      FB.login(function(response) {
        checkUserSynced(response, redirect);
      }, {scope: Drupal.settings.facebookPerms.join(','), display: 'popup'});
    }
    else {
      window.location.href = Drupal.settings.loginUrl;
    }
    return;
  }

  Drupal.settings.existingVote = val;
  var post = {
    token: Drupal.settings.token.voting,
    voteTag: Drupal.settings.voteTag
  };

  $.post([Drupal.settings.voteUrl, nid, val].join('/'), post, function(json){
    if (json.status) {
      var $v = $('.vote-count span');
      $v.html(parseInt($v.text(), 10) + 1);
    }
    if ($.isFunction(callback)) {
      callback(json);
    }
    if ($.isMobile(true)) {
      $('.video-entry').hide();
    }
    $.modal('<p>' + json.message + '</p>', {
      dialogClass: 'strutta-vote',
      width: 400,
      draggable: false,
      resizable: false,
      position: {
        my: "center bottom",
        at: "center bottom",
        offset: '0 -20',
        of: ".display-port"
      },
      create: function() {
        var $container = $(this).parents('.ui-dialog');
        $container.append($('<div class="bottom">'));
        if (typeof json.share != 'undefined') {
          $container.find('.ui-dialog-content').append(json.share);
        }
        if (typeof json.optin != 'undefined') {
          $container.find('.ui-dialog-content').append(json.optin);
        }
      },
      buttons: {
        Ok: function() {
          // Log opt in if set
          $('.vote-optin input:not(.opt-in-processed)').each(function() {
            $that = $(this).addClass('opt-in-processed');
            var optin = $that.is(':checked') ? 'yes' : 'no';
            $.post('/js/vote-optin/' + optin);
          });
          $(this).dialog('close');
          if ($.isMobile(true)) {
            $('.video-entry').show();
          }
        }
      }
    });
  }, 'json');
}

Drupal.behaviors.pendingVote = function(context) {
  $('body:not(.pending-vote-processed)').each(function(){
    $(this).addClass('pending-vote-processed');
    var v = $.cookie('pending_vote');
    if (v && Drupal.settings.userId > 0) {
      var p = v.split(':');
      vote(p[0], p[1]);
      $.cookie('pending_vote', '');
    }
  });
};

Drupal.behaviors.rankWidget = function(context) {
  $('a.widget-rank:not(.widget-rank-processed)').each(function(){
    var $widget = $(this).addClass('widget-rank-processed');
    var nid = $widget.attr('rel').replace('vote-', '');
    var $stars = $('.rating-star', $widget);
    $stars.each(function(i){
      var v = i + 1;
      var $star = $(this);
      $star.bind('mouseenter', function(){
        $widget.removeClass('display-average');
        $stars.removeClass('rating-star-on');
        $('.rating-star:lt(' + v + ')').addClass('rating-star-on');
      }).bind('mouseleave', function(e){
        $('.rating-star').removeClass('rating-star-on');
      }).click(function(){
        var $prompt = $('p.prompt-rate');
        var orig = $prompt.text();
        vote(nid, v, function(json) {
          // TODO switch to share tab with message
        });
        if (Drupal.settings.voteRequiresLogin) {
          $widget.addClass('voting-widget-disabled');
        }
        $stars.unbind('mouseenter').unbind('mouseleave').unbind('click');
        return false;
      });
    });
    $widget.bind('mouseleave', function(){
      var e = Drupal.settings.existingVote || 0;
      $('.rating-star:lt(' + e + ')').addClass('rating-star-on');
    });
  });
};

Drupal.behaviors.voteWidget = function(context) {
  $('a.widget-vote:not(.widget-vote-processed)').each(function(){
    var $widget = $(this).addClass('widget-vote-processed');
    var nid = $widget.attr('rel').replace('vote-', '');
    var orig = $widget.text();
    $widget.click(function(){
      vote(nid, 1);
      if (Drupal.settings.voteRequiresLogin) {
        $widget.addClass('voting-widget-disabled');
      }
      return false;
    });
  });
};

Drupal.behaviors.viewTimeline = function(context) {
  $('a.view-timeline:not(.view-timeline-processed)').each(function(){
    $(this).addClass('view-timeline-processed').click(function(){
      var $el = $('a[href=#box-timeline]');
      if ($el.length) {
        $el.click();
        return false;
      }
      return true;
    });
  });
};

Drupal.behaviors.quickTabs = function(context) {
  $('.entry-links:not(.entry-links-processed)').each(function(){
    $(this).addClass('entry-links-processed');
    $('li a', this).click(function(){
      $('.entry-links li a').removeClass('active');
      $(this).addClass('active');
      var id = $(this).attr('href');
      $('.entry-box:not(' + id + ')').hide();
      $(id).show();
      if (!Drupal.settings.facebookIsCanvas && !Drupal.settings.facebookIsTab && !$.isMobile(true)) {
        $.scrollTo(id, 400, function(){
          window.location.hash = id;
        });
      }
      return false;
    });
  });
};

Drupal.behaviors.selectedTab = function(context) {
  $('body:not(.selected-tab-processed)').each(function(){
    $(this).addClass('selected-tab-processed');
    var hash = window.location.hash;
    if (hash && hash.match(/^#box-/)) {
      var $box = $('.entry-links a[href=' + hash + ']');
      if ($box.length) {
        $('.entry-links li a').removeClass('active');
        $box.addClass('active');
        $('.display-boxes .entry-box').hide();
        $(hash).show();
      }
    }
  });
};

Drupal.behaviors.search = function(context) {
  $('#browse-search:not(.browse-search-processed)').each(function(){
    $(this).addClass('browse-search-processed').click(function(){
      $('#browse-wrapper').hide();
      $('#search-entries').show();
    });
  });
  $('#close-search:not(.close-search-processed)').each(function(){
    $(this).addClass('close-search-processed').click(function(){
      window.location = '/entries';
    });
  });
  $('#edit-search-phrase:not(.search-phrase-processed)').each(function(){
    var $i = $(this), v = $(this).val();
    $i.addClass('search-phrase-processed').focus(function(){
      if ($i.val() == v) {
        $i.val('');
      }
    }).blur(function(){
      if ($i.val().length < 1) {
        $i.val(v);
      }
    });
  });
  $('#search-form:not(.search-form-processed)').each(function(){
    $(this).addClass('search-form-processed').submit(function(){
      window.location = window.location.pathname + '?sort=search&order=' + encodeURIComponent($('#edit-search-phrase').val());
      return false;
    });
  });
};

Drupal.behaviors.sort = function(context) {
  // Mobile elements use a select box including tablets so we get native UI.
  if ($.isMobile(true)) {
    $('#entries-sort-select:not(.sort-processed)').each(function() {
      var q = $.parseQuery();
      if (q.sort) {
        $(this).val(q.sort);
      }
      $(this)
      .addClass('sort-processed')
      .change(function(event) {
        q.sort = this.value;
        var queryString = '?';
        var i = 0;
        for (var k in q) {
          if (!k) {
            continue;
          }
          queryString += k +'='+ q[k] +'&';
          i++;
        }
        window.location = window.location.pathname + queryString.substr(0, (queryString.length - 1));
      });
    });
    return;
  }

  if ($('#options-wrapper ul li').length <= 1) {
    $('#sort-entries').css('opacity', 0.3);
    $('#browse-trigger:not(.browse-trigger-processed)')
      .addClass('browse-trigger-processed')
      .css('cursor', 'default')
      .click(function () {
        return false;
      });
    $('#options-wrapper ul li a:not(.options-wrapper-processed)')
      .addClass('options-wrapper-processed')
      .css('cursor', 'default')
      .click(function () {
        return false;
      });
    return;
  }

  var open = false;
  function show() {
    $('#options-wrapper ul').addClass('open');
    $('#options-wrapper').css({overflow: 'visible'});
    open = true;
  }
  function hide() {
    $('#options-wrapper ul').removeClass('open');
    $('#options-wrapper').css({overflow: 'hidden'});
    open = false;
  }
  function toggle() {
    open ? hide() : show();
  }
  function select(href) {
    if (Drupal.settings.facebookIsCanvas && !$.isMobile(true) && Drupal.settings.published) {
      top.location = href;
    }
    else {
      window.location = href;
    }
  }
  $('#browse-trigger:not(.browse-trigger-processed)').each(function(){
    $(this).addClass('browse-trigger').click(function(){
      toggle();
    });
  });
  $('#options-wrapper:not(.options-wrapper-processed)').each(function(){
    $(this).addClass('options-wrapper-processed').bind('mouseleave', function(e){
      hide();
    });
    var el = $('li a.active', this).parents('li')[0];
		var idx = $('ul li', this).index(el);
		$('ul', this).css('top', -1 * 30 * idx);
    $('ul li a', this).click(function(){
      open ? select($(this).attr('href')) : show();
      return false;
    });
  });
};

Drupal.behaviors.flagEntry = function(context) {
  $('#entry-flag:not(.flag-processed)').each(function(){
    $(this).addClass('flag-processed').click(function(){
      var eid = $(this).attr('rel').replace(/flag-/, '');
      $.confirm(Drupal.settings.flagConfirm, function(){
        $.postJSON([Drupal.settings.flagUrl, eid].join('/'), {token: Drupal.settings.token.flag}, function(json){
          $.alert(json.message);
        });
      });
      return false;
    });
  });
};

Drupal.behaviors.deleteEntry = function(context) {
  $('#entry-delete:not(.delete-processed)').each(function(){
    $(this).addClass('delete-processed').click(function(){
      var eid = $(this).attr('rel').replace(/delete-/, '');
      $.confirm(Drupal.settings.deleteConfirm, function(){
        $.postJSON([Drupal.settings.deleteUrl, eid].join('/'), {token: Drupal.settings.token.remove}, function(json){
          if (json.status) {
            $.alert(json.message, function(){
              window.location = Drupal.settings.deleteRedirect;
            });
          }
          else {
            $.alert(json.message);
          }
        });
      });
      return false;
    });
  });
};

Drupal.behaviors.commentToggle = function(context) {
  $('.comments-post:not(.comments-post-processed)').each(function(){
    $(this).addClass('comments-post-processed').click(function(){
      $('.comments-form-wrapper').slideToggle();
      return false;
    });
  });
};

Drupal.behaviors.commentDelete = function(context) {
  $('.comment-delete:not(.comment-delete-processed)').each(function(){
    var $link = $(this);
    $link.click(function(){
      if ($.confirm(Drupal.settings.commentDeleteConfirm, function(){
        var cid = $link.attr('rel').replace(/comment-/, '');
        $.post([Drupal.settings.commentDeleteUrl, Drupal.settings.currentEntry, cid].join('/'), {token: Drupal.settings.token.remove}, function(json){
          if (json.status) {
            $('#comment-' + cid).fadeOut();
            var $count = $('span.comment-count');
            var n = parseInt($($count[0]).text(), 10);
            $count.text(--n);
          }
          else {
            $.alert(json.message);
          }
        }, 'json');
      }));
      return false;
    });
  });
};

Drupal.behaviors.shareToggle = function (context) {
  $('#strutta-contests-client-vote-form #edit-share').click(function () {
    $('#strutta-contests-client-vote-form #edit-text-wrapper').slideToggle(400);
    $('#strutta-contests-client-vote-form #edit-skip').toggle();
  });
};

/**
 *  Add scrollers to mobile devices vs a normal scroll bar.
 */
Drupal.behaviors.mobileTextEntryScrollers = function() {
  if (!$.isMobile(true)) {
    return;
  }

  $('.text-entry:not(.text-scrollers-processed)').each(function(i) {
    $(this).addClass('text-scrollers-processed');

    var $controls = $(this).next('.text-controls');
    if ($controls.length === 0) {
      return;
    }

    $controls.fadeIn('fast');

    var scrollOffset = $(this).height() / 4;
    var that = this;
    var touchEvents = !($('a.scroll-up', $controls)[0].ontouchstart != undefined);

    $('a.scroll-up', $controls)
    .click(function(event) { return false; })
    .bind(touchEvents ? 'touchstart' : 'mousedown', function(event) {
      var timeout = function() {
        $(that).animate({ scrollTop: (that.scrollTop - scrollOffset) }, 'fast');
        that.timeoutId = setTimeout(timeout, 200);
      };
      timeout();
    })
    .bind(touchEvents ? 'touchend' : 'mouseup mouseleave', function(event) {
      if (that.timeoutId) {
        clearTimeout(that.timeoutId);
        that.timeoutId = 0;
      }
    });

    $('a.scroll-down', $controls)
    .click(function(event) { return false; })
    .bind(touchEvents ? 'touchstart' : 'mousedown', function(event) {
      var timeout = function() {
        $(that).animate({ scrollTop: (that.scrollTop + scrollOffset) }, 'fast');
        that.timeoutId = setTimeout(timeout, 200);
      };
      timeout();
    })
    .bind(touchEvents ? 'touchend' : 'mouseup mouseleave', function(event) {
      if (that.timeoutId) {
        clearTimeout(that.timeoutId);
        that.timeoutId = 0;
      }
    });
  });
};

Drupal.behaviors.imageZoomy = function (context) {
  $('.image-entry:not(.zoomy-processed), .multiple-entry:not(.zoomy-processed)').each(function () {
    var $wrapper = $(this).addClass('zoomy-processed');
    var $img = $(this).find('img');
    var $that = $(this);
    var entryId = Drupal.settings.childEntry || Drupal.settings.currentEntry;

    if ($.isMobile(true) && Drupal.settings.mobileImages) {
      var images = Drupal.settings.mobileImages[entryId];
      $img.wrap($('<a>').attr('href', images.full).appendTo($wrapper));
      var resizeImage = function() {
        var src = images.portrait;
        if ($.isLandscape()) {
          src = images.landscape;
        }
        $img.attr('src', src);
      };
      $(window).bind('resize', resizeImage);
      resizeImage();
      return;
    }

    var largeImage = Drupal.settings.largeImages[entryId];

    function add(opts) {
      $wrapper.append($('<div class="zoomy zoomy-disabled">'));
      $that.zoomy($img, largeImage, function(){
        $('.zoomy-large').css({
          '-webkit-transition-property': '-webkit-box-shadow',
          '-webkit-transition-timing-function': 'ease-in',
          '-webkit-transition-duration': '500ms',
          '-webkit-box-shadow': '0 0 20px #000',
          '-moz-transition-property': '-webkit-box-shadow',
          '-moz-transition-timing-function': 'ease-in',
          '-moz-transition-duration': '500ms',
          '-moz-box-shadow': '0 0 20px #000'//,
        });
      }, opts);
      var large = new Image();
      large.onload = function() {
        $('.zoomy').fadeIn();
      };
      large.src = largeImage;
    }

    var img = new Image();
    img.onload = function() {
      if (Drupal.settings.facebookIsCanvas) {
        if (this.height >= 405 && this.width < 720) {
          add({largeTop: 200});
        }
      }
      else if (this.width >= 720 || this.height >= 405) {
        add();
      }
    };

    img.src = $img.attr('src');
  });
};

Drupal.behaviors.disableSubmit = function(context) {
  $('#strutta-submit-form:not(.disable-submit-processed)').each(function(){
    $(this).addClass('disable-submit-processed').submit(function(){
      $('#edit-submit', this).click(function(){
        return false;
      });
    });
  });
};

Drupal.behaviors.entryChildren = function(context) {
  $('.entry-children a:not(.entry-children-processed)').each(function(){
    var content = Drupal.settings.childContent[$(this).data('id')];
    var $el = $(content);
    if ($el.attr('src')) {
      var img = new Image();
      img.src = $el.attr('src');
    }
    $(this).click(function(){
      $('.entry-children a').removeClass('active');
      $(this).addClass('active');
      Drupal.settings.childEntry = $(this).data('id');
      var $wrap = $('<div class="multiple-entry">').html(content).hide();
      $('.display-content').html($wrap);
      $wrap.fadeIn();
      Drupal.attachBehaviors(document);
      return false;
    });
  });
};

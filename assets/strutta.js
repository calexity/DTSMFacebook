// Add toISOString for IE8
if (!Date.prototype.toISOString) {
  Date.prototype.toISOString = function() {
    function pad(n) { return n < 10 ? '0' + n : n; }
    return this.getUTCFullYear() + '-' +
      pad(this.getUTCMonth() + 1) + '-' +
      pad(this.getUTCDate()) + 'T' +
      pad(this.getUTCHours()) + ':' +
      pad(this.getUTCMinutes()) + ':' +
      pad(this.getUTCSeconds()) + 'Z';
  };
}

/**
 * Create a modal dialog based on an iframe.
 */
$.iframeDialog = function (url, opts) {

  opts = opts || {
    width: 600,
    height: 360
  };

  var $iframe = $('<iframe>')
    .attr('border', 0)
    .attr('allowtransparency', 'true')
    .attr('frameborder', 0)
    .attr('height', '100%')
    .attr('width', '100%')
    .attr('src', url);

  $.modal($iframe, opts);
};

/**
 * Fancy alert dialog.
 */
$.alert = function(message, onClose) {
  var ok = Drupal.settings.ok || 'OK';
  var opts = {
    draggable: false,
    resizable: false,
    buttons: {},
    dialogClass: 'strutta-alert',
    width: 500
  };
  opts.buttons[ok] = function() {
    $(this).dialog('close');
    if ($.isFunction(onClose)) {
      onClose();
    }
  };
  $.modal($('<p>').html(message), opts);
};

/**
 * Fancy confirm dialog.
 */
$.confirm = function(message, onYes, onNo, yes, no) {
  yes = yes || Drupal.settings.yes || 'Yes';
  no = no || Drupal.settings.no || 'No';

  var opts = {
    draggable: false,
    resizable: false,
    buttons: {},
    dialogClass: 'strutta-alert',
    width: 400,
    create: function() {
      var $container = $(this).parents('.ui-dialog');
      $container.find('button:first').addClass('button-no');
      $container.find('button:last').addClass('button-yes');
    }
  };
  opts.buttons[no] = function() {
    $(this).dialog('close');
    if ($.isFunction(onNo)) {
      onNo();
    }
  };
  opts.buttons[yes] = function() {
    $(this).dialog('destroy');
    if ($.isFunction(onYes)) {
      onYes();
    }
  };
  $.modal($('<p>').html(message), opts);
};

/**
 * Fancy confirm dialog.
 */
$.ask = function(message, onYes, onNo, yes, no) {

  yes = yes || Drupal.settings.yes || 'Yes';
  no = no || Drupal.settings.no || 'No';

  var $text = $('<textarea>');

  var opts = {
    draggable: false,
    resizable: false,
    buttons: {},
    dialogClass: 'strutta-alert',
    width: 400,
    create: function() {
      var $container = $(this).parents('.ui-dialog');
      $container.find('button:first').addClass('button-no');
      $container.find('button:last').addClass('button-yes');
    }
  };
  opts.buttons[no] = function() {
    $(this).dialog('close');
    if ($.isFunction(onNo)) {
      onNo($text.val());
    }
  };
  opts.buttons[yes] = function() {
    $(this).dialog('destroy');
    if ($.isFunction(onYes)) {
      onYes($text.val());
    }
  };

  $.modal($('<p>').html(message).append($text), opts);

};

/**
 *  A simple modal view.
 */
$.modal = function(message, opts) {
  var $div = $('<div class="dialog-modal"></div>').html(message);

  opts = $.extend({
    modal: true,
    show: 'fade',
    hide: 'fade',
    open: function () {
      // Disable the dialog feature of selecting the first control element.
      $("*:focus").blur();
      $('a', $div).attr('target', '_blank');
      $('object').hide();
      Drupal.attachBehaviors();
    },
    close: function() {
      $('object').show();
    }
  }, opts);

  $div.dialog(opts);

  return $div;
};

/**
 * $.getJSON-like behavior for POST requests.
 */
$.postJSON = function(path, args, callback) {
  $.post(path, args, callback, 'json');
};

/**
 * Determine the current user's mobile platform.
 *
 * @param keyword - string
 * - A keyword to compare with.
 *
 * @return BOOL
 *
 */
$.getPlatform = function() {
  if ($.isDevice('android')) return 'android';
  if ($.isDevice('iphone') || $.isDevice('ipad') || $.isDevice('ipod')) return 'ios';
  if ($.isDevice('linux')) return 'linux';
  if ($.isDevice('windows') || $.isDevice('MSIE')) return 'win';
  if ($.isDevice('os x') || $.isDevice('macintosh')) return 'mac';
  return $.isMobile() ? 'mobile' : 'other';
};

/**
 * Determine if the current user is on a specific device.
 *
 * @param keyword - string
 * - A keyword to compare with.
 *
 * @return BOOL
 *
 */
$.isDevice = function(keyword) {
  if (navigator.userAgent.toLowerCase().search(keyword) > -1) {
    return true;
  }
  return false;
};

/**
 *  Device orientation check.
 */
$.isLandscape = function() {
  return window.innerHeight < window.innerWidth;
};

/**
 *  Device orientation check.
 */
$.isPortrait = function() {
  return window.innerHeight > window.innerWidth;
};

/**
 * Determine if the current user is on a mobile device.
 *
 * @param BOOL
 * - True if tablet devices should be considered mobile as well.
 *
 * @param array
 * - Device names or keywords that should be considered.
 *
 * @return BOOL
 *
 */
$.isMobile = function(includeTablets, extraDevices) {
  var cookie = $.cookie('mobile');
  if (cookie == 1) {
    return true;
  } else if (cookie !== null && cookie === 0) {
    return false;
  }

  var agent = navigator.userAgent.toLowerCase();
  var devices = ['iphone', 'ipod', 'mobile', 'symbian', 'nokia', 'sonyericsson', 'windows phone os'];
  var tablets = ['ipad', 'android'];
  if (extraDevices && extraDevices.length > 0) {
    devices = devices.concat(extraDevices);
  }
  if (includeTablets !== null && includeTablets) {
    devices.concat(tablets);
  } else {
    for (var t in tablets) {
      if (agent.search(tablets[t]) > -1) {
        return false;
      }
    }
  }
  for (var i in devices) {
    if (agent.search(devices[i]) > -1) {
      return true;
    }
  }

  return false;
};


/**
 * Copy to Clipboard generic wrapper behavior
 */
Drupal.behaviors.copyClipboard = function(context) {
  // Need to wait for load in order for ZeroClipboard to correctly determine element sizing
  $(window).load(function () {
    $('.copy-clipboard:not(.copy-clipboard-processed)').each(function() {
      var $that = $(this).addClass('copy-clipboard-processed');

      var clip = new ZeroClipboard.Client($that[0]),
          text = $that.data('clipboard-text');

      clip.setText(text);
      clip.setHandCursor(true);

      if ($that.data('clipboard-alert')) {
        clip.addEventListener('mouseup', function() {
          $.alert('Copied text to clipboard:<br>' + text);
        });
      }
    });
  });
};

/**
 * Copy paste widget
 */
Drupal.behaviors.copyPaste = function (context) {
  $(window).load(function () {
    Drupal.behaviors.copyPaste.loaded = true;
    applyBehavior();
  });

  if (Drupal.behaviors.copyPaste.loaded) {
    setTimeout(function () {
      applyBehavior();
    }, 300);
  }

  function applyBehavior() {
    $('input.copypaste:not(.copypaste-processed)')
      .addClass('copypaste-processed')
      .each(function () {
        var that = this;
        setTimeout(function () {
          var text = $(that).prev().text(),
              clip = new ZeroClipboard.Client(that);
          clip.setText(text);
          clip.setHandCursor(true);
          clip.addEventListener('mouseup', function() {
            var label = $(that).val(), width = $(that)[0].offsetWidth;
            $(that).val('✓  Text Copied').css('width', width);
            setTimeout(function () {
              $(that).val(label).css('width', '');
            }, 3000);
          });
        }, 0);
      });
  }
};
Drupal.behaviors.copyPaste.loaded = false;

/**
 * JS tabs behavior.
 *
 * Uses 'visibility' instead of 'display' to allow invisible widgets to render.
 */
Drupal.behaviors.jsTabs = function (context) {
  $('ul.js-tabs').each(function () {
    var i = 0, $sections = {}, parent = this;
    do {
      $sections = $(parent).next().find('.js-tabs-section');
      if ($sections.length) {
        break;
      }
    } while (parent = parent.parentNode);

    $('> li', this).each(function () {
      var j = i++;
      $(this).click(function () {
        $(this).find('a').addClass('active').end().siblings().find('a').removeClass('active');
        $sections.filter(':eq('+ j +')').show();
        $sections.filter(':not(:eq('+ j +'))').hide();
        if (typeof jsTabsRefresh != 'undefined') jsTabsRefresh();
        return false;
      });
    });
  });
};

/**
 * Scroll to behaviour
 */
Drupal.behaviors.anchorScroll = function (context) {
  $('a.anchor-scroll:not(.anchor-processed)').each(function () {
    $(this)
    .addClass('anchor-processed')
    .click(function () {
      var anchor = this.href.split(/#/, 2)[1];
      if (anchor !== '') {
        $.scrollTo('#'+ anchor, { duration: 1000, margin: true });
      }
      return false;
    });
  });
};

/**
 * IE Label Click
 */
Drupal.behaviors.ieLabelClick = function(context) {
  if ($.browser.msie && $.browser.version < 7) {
    $('input[type=radio], input[type=checkbox]', context).each(function () {
      var element = this;
      $(this).parents('label').click(function (event) {
        if (event.target == this) {
          $(element).attr('checked', 'checked').click();
        }
      });
    });
  }
};

Drupal.behaviors.inputFocus = function (context) {
  $(':input:not(.input-focus-processed)').each(function() {
    $(this).focus(function() {
      $(this).addClass('focus');
    }).blur(function() {
      $(this).removeClass('focus');
    });
  });
};

Drupal.behaviors.detectFlashVersion = function(context) {
  var flashDetectDisplayed = false;
  setTimeout(function() {
    // Only displaying upload notice for upload components, for now
    $('object.swfupload:not(.swf-processed)').each(function() {
      $(this).addClass('swf-processed');
      if (!DetectFlashVer(10, 0, 0) && !flashDetectDisplayed) {
        $.alert('<strong>Flash Player 10</strong> or greater is required to use this site. <br />Please <a href="http://www.adobe.com/go/getflashplayer" target="_blank">click here to install it</a>.');
        flashDetectDisplayed = true;
      }
    });
  }, 100);
};

Drupal.behaviors.colorPicker = function(context) {
  $('.form-item .color-picker:not(.color-processed)').each(function() {
    var $el = $(this);
    var color = $(this).val();

    var shittyIE = $.browser.msie && ($.browser.msie < 9);

    if (color.length > 0) {
      var m = /#([\w]{2})([\w]{2})([\w]{2})/.exec(color);
      if (m !== null) {
        var lum = 0.3 * parseInt(m[1], 16) + 0.59 * parseInt(m[2], 16) + 0.11 * parseInt(m[3], 16);
        $(this).css({
          color: lum < 255/2 ? '#fff' : '#000',
          backgroundColor: color
        });
      }
    }

    var locked = false;

    function showPicker() {
      $('object').hide();
      $('#color-picker').remove();
      var offset = $(this).offset(),
          width = $(this).width();
      $('body').append($('<div id="color-picker" class="pngfix"></div>').css({
        top: offset.top - 245,
        left: offset.left + (width - 195 - 23) / 2
      }));

      if (!$el.val()) {
        $el.val('#FFFFFF');
      }

      if (!shittyIE) {
        $('#color-picker').farbtastic($el).animate({ opacity: 'show' }, { duration: 200, queue: false });
      }
      else {
        $('#color-picker').farbtastic($el).show();

        // Input field will lose focus even when Farbtastic returns false.
        // Manually lock widget into place.
        $('*', '#color-picker').mousedown(function () {
          locked = true;
        });
        $(document).mousedown(function (e) {
          locked = false;
          hidePicker();
        });
      }
    }

    function hidePicker() {
      if (locked) return false;

      $('object').show();
      $el.change();

      if (!shittyIE) {
        $('#color-picker').animate({ opacity: 'hide' }, { duration: 200, queue: false });
      }
      else {
        $('#color-picker').hide();
      }
    }

    $(this).addClass('color-processed');
    $(this).focus(showPicker).blur(hidePicker);
  });
};

Drupal.behaviors.charLimit = function(context) {
  $('.form-item .char-limit:not(.char-limit-processed)').each(function() {
    var $el = $(this).addClass('char-limit-processed');
    var $re = $(this).parents('.form-item').find('.description span.chars');
    var limit = parseInt($re.text());
    function set() {
      var v = limit - $el.val().length;
      v < 1 ? $re.css({color: 'red'}) : $re.removeAttr('style');
      $re.text(v);
    }
    if ($el.val().length > 0) {
      set();
    }
    $el.keyup(function() {
      set();
    });
  });
};

Drupal.behaviors.searchText = function(context) {
  $('.search-text:not(.search-text-processed)').each(function() {
    var o = $(this).val();
    $(this).addClass('search-text-processed').focus(function() {
      if ($(this).val() == o) {
        $(this).val('');
      }
    }).blur(function() {
      if ($(this).val().length < 1) {
        $(this).val(o);
      }
    });
  });
};

Drupal.behaviors.cancelSubmit = function(context) {
  $('.button-cancel:not(.cancel-processed)').each(function() {
    $(this).addClass('cancel-processed').click(function() {
      window.history.go(-1);
      return false;
    });
  });
};

Drupal.behaviors.tooltip = function(context) {
  $('.tooltip:not(.tooltip-processed)').each(function() {
    var timer;
    var $that = $(this).addClass('tooltip-processed');
    var $info = $('.more', this);
    var $tip = $('<div class="tooltip-more">');

    // Small tweak to allow separate styling for pro-tips in builder
    var klass = $(this).data('tooltip-classes');
    if ($(this).data('tooltip-classes')) {
      $tip.addClass(klass);
    }

    $info.find('a:not(.no-blank)').attr('target', '_blank');
    $that.hover(function() {
      if (timer) clearTimeout(timer);

      var o = $that.offset();
      $('body').append($tip);
      $tip.html($info.html()).css('left', -1000);

      var ow = Math.round($tip.width() / 2);
      var left = o.left - ow;
      if (left + $tip.width() > $(window).width() - 10) {
        left = o.left - $tip.width() * 0.9;
      }
      if ($that.width() > 50) {
        left += Math.round($that.width() / 2);
      }

      $tip.css({
        top: o.top + 20,
        left: left,
        opacity: 1,
        display: 'block'
      }).stop().animate({top: o.top + 30}, 200);

    }, function() {
      timer = setTimeout(function() {
        $tip.stop().fadeOut(200, function() {
          $(this).remove();
        });
      }, 500);

      $tip.mouseenter(function() {
        clearTimeout(timer);
      }).mouseleave(function() {
        $(this).fadeOut(100, function() {
          $(this).remove();
        });
      });
    }).click(function() {
      return false;
    });
  });
};

Drupal.behaviors.imageFade = function(context) {
  $('.image-crossfade:not(.image-crossfade-processed)').each(function() {
    $(this).addClass('image-crossfade-processed');
    $('.image-crossfade h4:gt(0)').css({opacity: 0});
    function setActive(i) {
      var $el = $('.image-crossfade h4:eq(' + i + ')').animate({opacity: 1}, 1500);
      $('.image-crossfade h4:not(#' + $el.attr('id') + ')').animate({opacity: 0}, 1500);
    }
    var i = 1;
    setInterval(function() {
      i = i < $('.image-crossfade h4').length ? i : 0;
      setActive(i++);
    }, 5000);
  });
};

Drupal.behaviors.selectClass = function(context) {
  function checkSelect($items) {
    $items.each(function() {
      var $item = $(this);
      var input = $('input', $item)[0];
      if (input && input.checked) {
        $item.addClass('selected');
      }
      else {
        $item.removeClass('selected');
      }
    });
  }
  $('.form-radios:not(.select-processed), .form-checkboxes:not(.select-processed)').each(function() {
    $(this).addClass('select-processed');
    var $items = $('.form-item', this);
    $('input', this).each(function() {
      checkSelect($items);
    }).change(function() {
      checkSelect($items);
    }).click(function() {
      checkSelect($items);
    });
  });
};

// Stop ugly ajax.js behaviour of scrolling to top of window
$(function () {
  if (!Drupal.Ajax) return;
  Drupal.Ajax.plugins.stopAjaxScroll = function (hook, args) {
    if (hook == 'scrollFind') {
      return false;
    }
    return true;
  };
});

Drupal.behaviors.modalDialog = function(context) {
  $('.modal:not(.modal-processed)').each(function() {
    $(this).addClass('modal-processed').click(function() {
      $.modal(Drupal.settings.alerts[$(this).attr('rel')], {title: $(this).attr('title'), width: 560});
      return false;
    });
  });
};

Drupal.behaviors.disableSubmit = function(context) {
  $('form.disable-submit:not(.disable-submit-processed)').each(function() {
    $(this).addClass('disable-submit-processed').submit(function() {
      $('#edit-submit', this).css({opacity: 0.5}).click(function() {
        return false;
      });
    });
  });
};

Drupal.behaviors.modalContent = function(context) {
  $('a[rel="modal"]:(.modal-processed)').each(function(i) {
    $(this).addClass('modal-processed').click(function(event) {
      if ($(this).is('.opened')) {
        return false;
      }
      $(this).addClass('opened');

      var that = this;
      var title = that._title ? that._title : 'Loading...';
      var message = that._message ?  that._message : null;
      var $modal = $.modal(message, {
        draggable: false,
        resizable: false,
        height: 'auto',
        width: '60%',
        position: 'center',
        title: title,
        close: function() {
          $(that).removeClass('opened');
        }
      });

      if (!message) {
        $.get(this.href, function(json) {
          if (!json) {
            $modal.dialog('close');
            return;
          }
          var data = Drupal.parseJson(json);
          if (!data) {
            $modal.dialog('close');
            return;
          }
          that._message = data.content;
          that._title = data.title;
          $modal.dialog('option', 'title', that._title);
          // Perform a simple transition between loading content.
          $widget = $modal.dialog('widget');
          $widget.css('display', 'none');
          $modal.html(that._message);
          setTimeout(function() {
            $modal.dialog('option', 'position', 'center');
            $('a', $widget).attr('target', '_blank');
            $widget.fadeIn('fast');
          }, 0);
        });
      }

      return false;
    });
  });
};

/**
 *  Placeholder support for browsers that do not support the placeholder attribute.
 */
Drupal.behaviors.placeholders = function(context) {
  var support = false;
  var test = $('<input type="text" />');
  try {
    if (test[0].placeholder !== undefined) {
      support = true;
    }
  } catch (err) {
  }
  if (!support) {
    $('input[placeholder]:not(.placeholder)').each(function(i) {
      var placeholder = $(this).attr('placeholder');
      var $that = $(this);
      $that
      .focus(function() {
        if ($that.val() == placeholder) {
          $that.val('');
        }
      })
      .blur(function() {
        if ($that.val() === '') {
          $that.val(placeholder);
        }
      })
      .addClass('placeholder')
      .val($that.attr('placeholder'));
    });
  }
};

/**
 *  Preload images.
 */
Drupal.behaviors.preloadImages = function(context) {
  if (!Drupal.settings.preloadImages) {
    return;
  }
  for (var i = 0; i < Drupal.settings.preloadImages.length; i++) {
    var src = Drupal.settings.preloadImages[i];
    (new Image()).src = src;
  }
};

/**
 *  Check if an element is a child of another.
 */
$.fn.isChildOf = function(exp) {
  return $(this).parents().filter(exp).length > 0;
};

/**
 *  JS based selectbox.
 */
var StruttaSelectbox = function(element, options) {
  var defaults = {
    value: 0,
    onSelect: function() {}
  };

  this.options = $.extend(defaults, options);
  this.$el = $(element);
  this.$list = $('ul', this.$el);
  this.$proxy = $('<div>').appendTo(this.$el);
  this.$select = null;

  this.expanded = false;
  this.sizes = [];
  this.size = 0;

  this.selectedIndex = 0;

  /**
   * Measure.
   */
  this.measure = function () {
    if (!this.size) {
      var that = this;
      this.$list.children().each(function(index) {
        // Handle dynamic positioning.
        var width = $(this).width();
        that.size += width;
        that.sizes.push(width);
      });
    }
  };

  /**
   * Show.
   */
  this.show = function () {
    this.$el.fadeIn('fast');
    this.measure();
    this.sizeTo(this.sizes[this.selectedIndex]);
  };

  /**
   * Hide.
   */
  this.hide = function () {
    this.$el.fadeOut('fast');
  };

  /**
   * Size to given width.
   */
  this.sizeTo = function (width, animate) {
    var that = this;

    function step(width) {
      // Size container/list.
      that.$el.width(width + 16);
      that.$list.width(width);

      // Calculate how far along the transition we are (tween).
      var buttonSize = that.sizes[that.selectedIndex],
          tween = (width - buttonSize) / (that.size - buttonSize),
          accum = 0;

      // Shift buttons proportionally to the summed width of the previous buttons.
      that.$list.children().each(function (index) {
        $(this).css('marginLeft', Math.round(tween * accum));
        accum += that.sizes[index];
      });
    }

    if (animate) {
      this.$proxy.animate({ marginLeft: width }, {
        queue: false,
        duration: Drupal.settings.shiftKeyDown ? 1500 : 300,
        step: function (now) {
          step(Math.round(now));
        }
      });
    }
    else {
      this.$proxy.css('marginLeft', width);
      step(width);
    }
  };

  /**
   * Expand the options.
   */
  this.expand = function (fake) {
    this.expanded = true;
    this.sizeTo(this.size, !fake);
  };

  /**
   * Collapse the options.
   */
  this.collapse = function (fake) {
    this.expanded = false;
    this.sizeTo(this.sizes[this.selectedIndex], !fake);
  };

  /**
   * Select an option.
   */
  this.select = function(selectedIndex) {
    if (this.selectedIndex == selectedIndex) return;

    var $item = $('a', this.$list.children().get(selectedIndex));
    var selectedValue = $item.attr('rel').replace(/option-/, '');
    this.options.onSelect(selectedIndex, selectedValue, $item);
    this.highlight(selectedIndex);
  };

  /**
   * Update active class.
   */
  this.highlight = function (selectedIndex) {
    var that = this;

    this.selectedIndex = selectedIndex;
    this.$list.children().removeClass('active').each(function (index) {
      $(this).css('z-index', 10 - Math.abs(index - that.selectedIndex));
    });
    $(this.$list.children()[selectedIndex]).addClass('active');
  };

  /**
   * Initialize the selectbox.
   */
  this.init = function() {
    var that = this;

    // Prepare list elements, add helper classes, bind click handlers.
    this.$list.children().each(function(index) {
      $('a', this).data('selectIndex', index);

      // Assign first/last classes.
      if (index === 0) {
        $(this).addClass('first');
      } else if (index == (that.$list.children().length - 1)) {
        $(this).addClass('last');
      }

      // Bind click handler on item.
      // TODO: need to make work on iOS. Test android.
      $('a', this).bind('click', function(event) {
        if (that.$select) {
          that.$select.focus();
        } else {
          that.select(index);
        }
        return false;
      });
    });

    // Bind mouse hovering handlers.
    this.$el.bind('mouseenter', function(event) {
      that.expand();
    });
    this.$el.bind('mouseleave', function(event) {
      that.collapse();
    });

    // Highlight selected button.
    var index = $('a[rel=option-' + this.options.value +']', this.$list).data('selectIndex');
    this.highlight(index);
    this.collapse(true);

    // Use real select box for mobile clients (disabled).
    if (false && $.isMobile(true)) {
      this.$select = $('<select>')
      .css({
        visibility: 'hidden'
      })
      .change(function(event) {
        alert('changed');
      })
      .appendTo(this.$el);
      this.$list.children().each(function() {
        var value = $(this).html();
        that.$select.append($('<option>'+ value +'</option>'));
      });

    }
  };
  this.init();
};

// Video format constants.
var STRUTTA_VIDEO_SMALL_H264 = 1;
var STRUTTA_VIDEO_MEDIUM_H264 = 4;
var STRUTTA_VIDEO_LARGE_H264 = 5;

/**
 * Video player.
 */
var StruttaVideoPlayer = function(element, data, useHTML5Player) {
  var that = this;

  this.$element = $(element);
  this.$options = null;
  this.$player = null;
  this.$play = null;

  this.selectBox = null;

  this.isHTML5Player = useHTML5Player;
  this.video = data;

  this.currentVideoType = {
    'auto':   STRUTTA_VIDEO_SMALL_H264,
    'slow':   STRUTTA_VIDEO_SMALL_H264,
    'medium': STRUTTA_VIDEO_MEDIUM_H264,
    'fast':   STRUTTA_VIDEO_LARGE_H264
  }[Drupal.settings.speedTest || 'slow'];

  // Give speedtest a chance to complete.
  this.initialized = false;
  if (Drupal.settings.speedTest == 'auto') {
    var oldTest = window.onSpeedTest;
    window.onSpeedTest = function (complete, latency, quality) {

      that.currentVideoType = {
        'slow':   STRUTTA_VIDEO_SMALL_H264,
        'medium': STRUTTA_VIDEO_MEDIUM_H264,
        'fast':   STRUTTA_VIDEO_LARGE_H264
      }[quality];
      that.init();

      oldTest(complete, latency, quality);
    };

    // Wait at most 1 second.
    setTimeout(function () {
      that.init();
    }, 1000);
  }
  else {
    setTimeout(function () {
      that.init();
    }, 0);
  }

  /**
   *  Display the appropriate video player.
   */
  this.display = function (autoplay) {
    var poster = (this.video.thumbnail ? this.video.thumbnail : '');
    var videoFilePath = this.getCurrentVideoFilePath();

    this.setOptions();
    if (this.$player) {
      this.$element.find('> :not(#video-selector, #video-proxy)').remove();
    }

    // Youtube.
    if (this.video.type == 'youtube') {
      $iframe = $('<iframe/>').addClass('youtube-player').attr('src', videoFilePath.replace(/\/v\//, '/embed/'));
      this.$element.append($iframe);
    }

    // HTML5 player.
    else if (this.isHTML5Player) {

      // Play button for Android.
      function playClickToggle() {
        var video = that.$player[0];
        if ($.isDevice('android')) {
          if (video.paused || video.ended) {
            video.play();
          } else {
            video.pause();
          }
          playButtonState();
        }
      }
      function playButtonState() {
        var video = that.$player[0];
        that.$play && that.$play[(video.ended ||video.paused) ? 'show' : 'hide']();
      }
      if (!this.$play && $.isMobile(true) && $.isDevice('android')) {
        this.$play = $('<a id="play-button">').bind('click', playClickToggle).appendTo(this.$element);
      }

      // Uploaded videos.
      if (videoFilePath) {
        this.$player = $('<video>')
        .attr({
          autoplay: autoplay ? 'autoplay' : '',
          controls: $.isDevice('android') ? '' : 'controls',
          poster: poster,
          height: this.video.settings.height,
          wmode: 'transparent',
          width: this.video.settings.width
        })
        .append($('<source>').attr({src: videoFilePath, type: 'video/mp4'}))
        .bind('click', playClickToggle)
        .bind('pause', playButtonState)
        .bind('ended', playButtonState)
        .bind('error', function (event) {
          that.switchToFlash();
        });

      }
      this.$element.append(this.$player);
    }

    // Flash player.
    else {
      var flashvars = {
        backgroundColor: '#000',
        controlBarMode: 'docked',
        controlBarAutoHide: 'true',
        controlBarAutoHideTimeout: 0.6,
        plugin_youtube: Drupal.settings.flashVideoPlayer.youTubePlugin,
        poster: poster,
        src: videoFilePath,
        skin: Drupal.settings.flashVideoPlayer.skin,
        verbose: true
      };

      if (autoplay) {
        flashvars.autoPlay = true;
      }

      this.$element.flash({
        allowfullscreen: 'true',
        allowscriptaccess: 'always',
        src: Drupal.settings.flashVideoPlayer.src,
        flashvars: flashvars,
        width: '100%',
        height: '100%',
        wmode: 'transparent'//,
      },
      {
       expressInstall: Drupal.settings.flashVideoPlayer.expressInstall,
       version: '10.1.0'
      }, function(htmlOptions) {
        that.$player = $($.fn.flash.transform(htmlOptions));
        that.$element.append(that.$player);
      });
    }
  };

  /**
   *  Get the current video file based off the speed test suggested video type.
   */
  this.getCurrentVideoFilePath = function() {
    if (this.video.type == 'youtube' && this.video.url) {
      return this.video.url;
    }
    if (!this.video.files) {
      return false;
    }
    var file = this.video.files[this.currentVideoType];
    if (!file) {
      var types = [STRUTTA_VIDEO_LARGE_H264, STRUTTA_VIDEO_MEDIUM_H264, STRUTTA_VIDEO_SMALL_H264];
      for (var i = 0; i < types.length; i++) {
        file = this.video.files[types[i]];
        if (file) {
          this.currentVideoType = types[i];
          break;
        }
      }
    }
    if (file) {
      return this.video.settings.storage + file;
    } else {
      return this.video.url;
    }
  };

  /**
   *  Play the video for a given type.
   */
  this.playVideoType = function(videoType) {
    var types = {};
    types[STRUTTA_VIDEO_SMALL_H264] = 'slow';
    types[STRUTTA_VIDEO_MEDIUM_H264] = 'medium';
    types[STRUTTA_VIDEO_LARGE_H264] = 'fast';

    Drupal.speedTestSave && Drupal.speedTestSave(types[videoType]);
    this.currentVideoType = videoType;

    if (!this.video.files[videoType]) {
      return;
    }
    var url = this.video.settings.storage + this.video.files[videoType];
    if (this.isHTML5Player) {
      this.$player.attr({src: url, autoplay: 'autoplay'});
    } else {
      this.display(true);
    }
  };

  /**
   *  Set the different video format options.
   */
  this.setOptions = function() {
    if (!this.$options && this.video.options) {
      this.$options = $(this.video.options);
      this.$element.append(this.$options);

      $('.custom-selectbox:not(.custom-selectbox-processed)', this.$element).each(function() {
        $(this).addClass('custom-selectbox-processed');
        that.selectBox = new StruttaSelectbox(this, {
          value: that.currentVideoType,
          onSelect: function(selectedIndex, selectedValue, $element) {
            that.playVideoType(selectedValue);
          }
        });
      });

      if ($.isMobile(true)) {
        // TODO: Revisit when we implement our own video controls.
        // iOS eats all events when video.controls = true;
        that.selectBox.hide();
      } else {
        this.$element
        .bind('mouseenter', function(event) {
          if (that.$options.attr('display') != 'block') {
            that.selectBox.show();
            that.shouldHideOptions = false;
          }
        })
        .bind('mouseleave', function(event) {
          that.shouldHideOptions = true;
          if (!$(event.target).isChildOf(that.$options)) {
            setTimeout(function() {
              if (!that.shouldHideOptions) {
                return;
              }
              that.selectBox.hide();
            }, 600);
          }
        });
      }
    }
  };

  this.switchToFlash = function() {
    this.isHTML5Player = false;
    this.display();
  };

  this.init = function() {
    if (this.initalized) return;
    this.initalized = true;

    this.display();
  };

};

/**
 * Video player behavior.
 */
Drupal.behaviors.videoPlayer = function(context) {
  if (!Drupal.settings.videos) {
    return;
  }
  var html5VideoIsSupported = false;
  var tester = document.createElement('video');
  var bool = !!tester.canPlayType;
  if (bool) {
    // Workaround required for IE9, which doesn't report video support without audio codec specified. bug: 599718 @ msft connect.
    var h264 = 'video/mp4; codecs="avc1.42E01E';
    if (tester.canPlayType(h264 + '"') || tester.canPlayType(h264 + ', mp4a.40.2"')) {
      html5VideoIsSupported = true;
    }
  }
  // TODO: remove this once desktop browsers don't suck with video.
  if (!$.isMobile(true)) {
    html5VideoIsSupported = false;
  }

  // Process videos.
  var isProcessed = 'video-player-processed';
  for (var id in Drupal.settings.videos) {
    var $el = $('#'+ id +':not(.'+ isProcessed +')');
    if (!$el.length) {
      continue;
    }
    $el.addClass(isProcessed);
    new StruttaVideoPlayer($el, Drupal.settings.videos[id], html5VideoIsSupported);
  }
};

Drupal.behaviors.shiftKey = function (context) {
  if ($('body').is('shift-processed')) return;
  $('body').addClass('shift-processed');

  function hit(event) {
    Drupal.settings.shiftKeyDown = event.shiftKey;
  }

  $(document).keyup(hit);
  $(document).keydown(hit);
};

Drupal.behaviors.fuFB = function (context) {
  $('meta[property="og:url"]').remove();
};

Drupal.behaviors.submitsForm = function(context) {
  $('.submits-form:not(.submits-form-processed)').each(function() {
    $(this).addClass('submits-form-processed').change(function() {
      $(this).parents('form').submit();
    });
  });
};

Drupal.behaviors.editInPlace = function(context) {
  $('.edit-in-place:not(.in-place-processed)').each(function() {
    var $parent = $(this).parents('.form-item:first');
    var $edit = $parent.find('.field-suffix');
    var $input = $parent.find(':input');
    $(this).addClass('in-place-processed');
    $edit.click(function() {
      $input.focus();
    });
    $input.blur(function() {
      $edit.show();
      $input.removeClass('active');
    }).focus(function() {
      $edit.hide();
      $input.addClass('active');
    });
  });
};

/*
Drupal.behaviors.beforeUnload = function(context) {
  $('form.before-unload:not(.before-unload-processed)').each(function() {
    $(this).addClass('before-unload-processed');
    $(window).bind('beforeunload', function(e) {
      return Drupal.settings.beforeUnloadMessage;
    });
    $('form').submit(function() {
      $(window).unbind('beforeunload');
    });
  });
};
*/

Drupal.behaviors.chosen = function(context) {
  $('select.chosen:not(.chosen-processed)').each(function() {
    $(this).addClass('chosen-processed').chosen();
  });
};

Drupal.behaviors.ajaxChosen = function(context) {
  $('select.ajax-chosen:not(.ajax-chosen-processed)').each(function() {
    var $select = $(this).addClass('ajax-chosen-processed');
    $select.ajaxChosen({
      method: 'GET',
      url: $select.data('path'),
      dataType: 'json'
    }, function (data) {
      var terms = {};
      $.each(data, function (i, val) {
        terms[i] = val;
      });
      return terms;
    });
  });
};

Drupal.behaviors.shortener = function(context) {
  $('.shorten-url:not(.shorten-url-processed)').each(function() {
    var $input = $(this).addClass('shorten-url-processed');
    var $trigger = $($input.data('trigger'));
    var $target = $($input.data('target'));
    function shorten(url) {
      $.get('/js/shorten', {url: url}, function(result) {
        $target.val($target.val() + ' ' + result);
        $input.val('');
      });
    }
    $trigger.click(function() {
      shorten($input.val());
      return false;
    });
    $input.keypress(function(e) {
      if (e.charCode === 13) {
        shorten($input.val());
        return false;
      }
    });
  });
};

// Confirm message handler for submit buttons
Drupal.behaviors.confirmOnSubmit = function(context) {
  $('.confirm-submit:not(.confirm-submit-processed)').each(function() {
    var $that = $(this).addClass('confirm-submit-processed');

    // Dialog data
    var message = $that.data('message') || 'Are you sure?';
    var yes = $that.data('yes') || 'Yes';
    var no = $that.data('no') || 'No';

    // Confirm dialog
    var confirmed = false;
    $that.click(function() {
      if (!confirmed) {
        $.confirm(message, function() {
          confirmed = true;
          $that.click();
        }, null, yes, no);
        return false;
      }
    });
  });
};

// Confirm message handler for submit buttons
Drupal.behaviors.productSlider = function() {
  $('div.slideshow:not(.slideshow-processed)').each(function () {
    // Setup
    var screenSelector = '.screens'
      , screensWidth = $(screenSelector).width()
      , offset = $(screenSelector).offset()
      , whichScreen = 0
      , $that = $(this).addClass('slideshow-processed')
      , clickedNext = clickedPrev = false;

    var zeros = {
      width: 0,
      marginLeft: 0,
      marginRight: 0
    };

    // Slide right
    $('.slide-next', $that).click(function() {
      // Prevent clicks during animation
      if (clickedNext) return false;
      clickedNext = true;

      // Add first div to end
      var $firstScreen = $('.screen:first-child', $that);
      $($firstScreen).clone().appendTo(screenSelector);
      $(screenSelector).toggleClass('highlight');

      $firstScreen.animate(zeros, 300, 'easeOutQuad', function() {
        // Remove 1st el and reset position
        whichScreen++;
        if (whichScreen > 4) {
          $(this).css({ left: '-1190' });
          whichScreen = 1;
        }
        $(screenSelector).children().first().remove();
        clickedNext = false;
      });
    });

    $('.slide-prev').click(function () {
      if (clickedPrev) return false;
      clickedPrev = true;

      var $lastScreen = $('.screen:last-child', $that);
      $lastScreen.css(zeros);

      // $($lastScreen).clone().prependTo(".screens");
      $lastScreen.clone().prependTo(screenSelector);

      $(screenSelector).toggleClass("highlight");
      var $screens = $('.screens');

      $('.screens').children().first().animate({
        width: 640,
        marginLeft: 0,
        marginRight: 40
      }, 300, 'easeOutQuad', function() {
        // Remove
        $(screenSelector).children().last().remove();
        clickedPrev = false;
      });
    });
  });
}

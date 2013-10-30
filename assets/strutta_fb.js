Drupal.behaviors.fbLinkTarget = function(context) {
   // Internal links open apps.facebook.com URL.
  if (Drupal.settings.facebookIsCanvas && !$.isMobile(true) && Drupal.settings.published) {
    $('a[href^="/"]:not(.canvas-processed)').each(function() {
      $(this).addClass('canvas-processed');
      if (!$(this).attr('target')) {
        $(this).attr('target', '_parent');
      }
      var href = $(this).attr('href');
      $(this).attr('href', Drupal.settings.facebookAppUrl + href.replace(/^\//, ''));
    });
  }

  // External links open in new window.
  if (Drupal.settings.facebookIsCanvas || Drupal.settings.facebookIsTab) {
    $('a[href^="http://"]:not(.external-processed):not(.canvas-processed)').each(function() {
      $(this).addClass('external-processed');
      if (!$(this).attr('target')) {
        $(this).attr('target', '_blank');
      }
    });
  }
};

/**
 *  Force a redirect for mobile users to show the whole tab. This is a workaround for FB mobile tab support.
 */
Drupal.behaviors.fbMobileTabs = function(context) {
  if (Drupal.settings.facebookIsTab && $.isMobile(true)) {
    if (top != window) {
      top.location = window.location;
    }

    // Fix FB as on first load, it thinks it's not a mobile device.
    // TODO: report this issue to Facebook. When ?&signed_request=[longassvalue]# is in the url, it will never use mobile styles.
    var t = function() {
      try {
        if ($.isMobile(true)) {
          if (!FB.UA.mobile()) {
            // Refresh the page so Facebook can fix itself.
            window.location = Drupal.settings.basePath;
          }
        }
      }
      catch (error) {
        setTimeout(t, 300);
      }
    };
    setTimeout(t, 300);
  }
};

Drupal.behaviors.fbLogin = function(context) {
  $('a.fb-login:not(.fb-login-processed)').each(function(){
    var $that = $(this).addClass('fb-login-processed');
    var redirect = $that.attr('href');
    var params = $.parseQuery();

    // If scope passed in data attribute, split into array
    var dataScope = $that.data('scope') ? $that.data('scope').split(',') : null;
    var scopeArray = dataScope || Drupal.settings.facebookPerms;

    // Check that email permission is included
    if ($.inArray('email', scopeArray) === -1) {
      scopeArray.push('email');
    }

    var permissions = scopeArray.join(',');

    // Set redirect
    if (params.destination) {
      redirect = decodeURIComponent(params.destination);
      if (redirect.charAt(0) != '/' && !redirect.match(/^http/)) {
        redirect = '/' + redirect;
      }
    }

    // Check for login permission
    $that.click(function() {
      $('span', $that).text(Drupal.settings.loadingText);
      FB.login(function(resp) {
        checkUserSynced(resp, permissions, redirect);
      }, {scope: permissions, display: 'popup'});
      return false;
    });
  });
};

Drupal.behaviors.fbLogout = function(context) {
  $('.fb-logout:not(.fb-logout-processed)').each(function() {
    $(this).addClass('fb-logout-processed').click(function() {
      FB.logout(function() {
        window.location = '/logout';
      });
      return false;
    });
  });
};

function checkUserDummy(callback) {
  callback({status: 1});
}

function checkUserLoggedIn(redirect, scope) {
  var permissions = '';
  scope = scope ? scope : Drupal.settings.facebookPerms;
  permissions = scope.join(',');
  FB.login(function(response) {
    checkUserSynced(response, permissions, redirect);
  }, {scope: permissions, display: 'popup'});
}

function checkUserSynced(response, permissions, redirect) {
  if (response.status === "connected") {
    // User is logged into FB and has authenticated the app
    var target = window;
    redirect = redirect || window.location.pathname;

    if (typeof redirect == 'string') {
      // Setup redirect
      if (redirect.match(/^\/auth/)) {
        redirect = '/';
      }
      else if (redirect.match(/apps\.facebook\.com/)) {
        target = window.top;
      }
    }

    // Add permissions to authResponse object to pass to AJAX request
    var data = response.authResponse;
    data.permissions = permissions;

    // Attempt to identify FB user and create if new
    $.post('/facebook/user/js', data, function(json) {
      if (!json.status) {
        $.alert(json.message);
      }
      else {
        Drupal.settings.userId = json.message; // new userid
        if (typeof redirect == 'string') {
          target.location = redirect;
        }
        else if ($.isFunction(redirect)) {
          redirect(json);
        }
      }
    }, 'json');
  }
  else {
    // User is either not logged into FB or has not authenticated the app
    window.location = '/authcancel?destination=' + encodeURIComponent(redirect);
  }
}

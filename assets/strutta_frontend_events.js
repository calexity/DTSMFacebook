$(function() {

  // Track share events
  Strutta.share.after.push(function(type, entry) {
    $.get('/js/share/' + (entry || 0) + '/' + type);
  });

});

Drupal.behaviors.roundSelect = function(context) {
  $('#strutta-contests-client-preview-select-round:not(.select-processed)').each(function(){
    var $that = $(this);
    $('select', this).change(function(){
      console.log('change');
      $that.submit();
    });
  });
};
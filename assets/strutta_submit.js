Drupal.behaviors.submitDuringUpload = function (context) {
  $('#edit-submit:not(.dialog-processed)').each(function () {
    $(this).addClass('dialog-processed').click(function () {
      if ($('span.upload-progress').is(':visible')) {
        $.alert(Drupal.settings.waitForUploadMsg);
        return false;
      }
    });
  });
};

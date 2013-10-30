Drupal.behaviors.s3Upload = function(context) {
  $('.s3-upload:not(.s3-upload-processed)').each(function() {
    $(this).addClass('s3-upload-processed');

    if (!Drupal.settings.uploads) {
      return;
    }

    var elementId = $(this).attr('id');
    if (!Drupal.settings.uploads[elementId]) {
      return;
    }

    var settings = Drupal.settings.uploads[elementId];
    var $el = $('#' + elementId);
    var $progress = $('.upload-progress', this);
    var overlayId = 'overlay-' + elementId;
    var imagePreview = 0;
    var completeTriggered = false;

    // Only support image previews when requested.
    if (Drupal.settings.S3Upload[elementId] && Drupal.settings.S3Upload[elementId].imagePreview) {
      imagePreview = 1;
    }

    $('.upload-clear', $el).click(function(){
      $('.upload-fid', $el).val('').change();
      $('.upload-complete', $el).fadeOut(function(){
        $(this).remove();
      });
      $(this).fadeOut();
    });

    function uploadDebugHandler(message) {
      console.log(message);
      return;
    }

    function uploadSuccessEventHandler(file, serverData) {

      if (completeTriggered) {
        return;
      }

      completeTriggered = true;

      var params = {
        name : settings.name,
        filename : file.name,
        filesize : file.size,
        preview: imagePreview
      };

      // Save file data async to ensure we have a record
      $.post('/upload/js', params, function(json) {
        // Fill up progress bar.
        var max = $progress.width();
        $('span', $progress).css({width: max + 'px'});

        $('.upload-fid', $el).val(json.fid).trigger('change', [json]);

        // Delay feedback to allow the bar to fill up.
        setTimeout(function () {
          $('.upload-progress', $el).fadeOut('fast', function(){
            $el.append(json.message);
            $('.upload-clear', $el).fadeIn();
          });
        }, 250);
      }, 'json');
    }

    function uploadProgressHandler(file, bytesLoaded, fake) {
      var max = $progress.width();
      // Save last 5% for ajax request.
      var percent = (bytesLoaded / file.size) * 0.95;
      var width = Math.ceil(percent * max);
      $progress.find('span').css({width: width + 'px'});
    }

    function uploadErrorHandler() {
      $.alert(Drupal.settings.S3Upload.errorMessage);
    }

    function uploadCompleteHandler(file) {
      uploadSuccessEventHandler(file);
    }

    function uploadDialogCompleteHandler(queueSize) {
      try {
        var file = swfu.getFile();
        if (!file) return;
        swfu.startUpload();

        $('span', $progress).css({width: 0});
        $progress.fadeIn('fast');
        $('.upload-complete', $el).remove();
        $('.upload-clear', $el).hide();
      } catch (e) {
        console.log(e);
      }
    }

    var swfu = new SWFUpload({
      post_params: {
        'key': settings.name,
        'AWSAccessKeyId': Drupal.settings.S3Upload.accessKey,
        'Policy': Drupal.settings.S3Upload.policy,
        'success_action_status': '201',
        'Signature': Drupal.settings.S3Upload.signature,
        'acl': Drupal.settings.S3Upload.acl
      },

      // General settings
      http_success : [201, 202],
      file_post_name: 'file',
      file_types : settings.types,
      upload_url: 'https://s3.amazonaws.com/' + Drupal.settings.S3Upload.bucketName,
      flash_url: Drupal.settings.S3Upload.swfFile,
      file_size_limit: settings.limit,
      button_action : SWFUpload.BUTTON_ACTION.SELECT_FILE,

      // Status callbacks
      debug_handler: uploadDebugHandler,
      upload_progress_handler: uploadProgressHandler,
      file_dialog_complete_handler: uploadDialogCompleteHandler,
      upload_success_handler: uploadSuccessEventHandler,
      upload_error_handler: uploadErrorHandler,
      upload_complete_handler: uploadCompleteHandler,

      /*
      file_dialog_start_handler: uploadDialogStartHandler,
      upload_start_handler: uploadStartEventHandler,
      file_queue_error_handler: uploadQueueErrorHandler,
      */

      // Button settings
      button_placeholder_id: overlayId,
      button_width: 260,
      button_height: 40,
      button_cursor: SWFUpload.CURSOR.HAND,
      button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
      debug: true

    });
  });
};
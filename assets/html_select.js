Drupal.behaviors.htmlSelect = function (context) {
  $('div.form-html-select:not(.form-html-select-processed)').each(function () {
    $(this).addClass('form-html-select-processed');

    var $inputField = $('input', this);
    var multi = !!$(this).data('multiple');
    var $lis = $('li', this);
    var selection = [];

    function updateDisplay() {
      $lis.removeClass('selected').find('.icon-ok').remove();
      $.each(selection, function(i, v) {
        $li = $('li[data-select-value="' + v + '"]').addClass('selected');
        if (multi) {
          $li.append($('<i class="icon-ok">'));
        }
      });
      $inputField.val(selection.join(','));
    }

    function selectItem(v) {
      if (!multi) {
        selection = [];
      }
      if ($.inArray(v, selection) != -1) {
        selection.splice($.inArray(v, selection), 1);
      }
      else {
        selection.push(v);
      }
      updateDisplay();
    }

    $('li:not(.disabled)', this)
      .hover(function () { $(this).addClass('hover'); },
             function () { $(this).removeClass('hover'); })
      .mousedown(function () {
        // Use attr() instead of data() since data() value auto-converts to type.
        // If type is number and number is too large, may auto-round to an int which is bounded to a certain precision and may auto-round
        selectItem($(this).attr('data-select-value'));
        return false;
      });

    if ($inputField.val() !== '') {
      selection = $inputField.val().split(',');
      updateDisplay();
    }
  });
};

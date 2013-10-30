Drupal.behaviors.analyzeBrowser = function (context) {

  /**
   * 64-bit Ghetto hash based on Murmur2.
   */
  function ghettoHash(data) {
    // Grab 4 characters as a single 32-bit int (ignore unicode).
    function string2int(data, offset) {
      return ((((((data.charCodeAt(offset) || 0
          ) << 8) + (data.charCodeAt(offset + 1) || 0)
        ) << 8) + (data.charCodeAt(offset + 2) || 0)
      ) << 8) + (data.charCodeAt(offset + 3) || 0);
    }

    // 32-bit int multiply
    function mul32(a, b) {
        var ah = (a >> 16) & 0xffff, al = a & 0xffff;
        var bh = (b >> 16) & 0xffff, bl = b & 0xffff;
        var high = ((ah * bl) + (al * bh)) & 0xffff;
        return ((high << 16)>>>0) + (al * bl);
    }

    // MurmurHash2 x 2
    var m = 0x5bd1e995, r = 24, k;
    var h1 = 0x9abcdf07 ^ data.length;
    var h2 = 0x1234567d ^ data.length;

    // Add finalizing step for additional bit mixing.
    data += '[#`\|S9>';
    data += data.substring(0, 4);

    // Process 4 bytes at a time.
    for (var i = 0; i < data.length; i += 4) {

      // First hash.
      k = string2int(data, i);

      k = mul32(k, m);
      k ^= k >> r;
      k = mul32(k, m);

      h1 = mul32(h1, m);
      h1 ^= k;

      // Second hash. Shift data by 2 bytes.
      k = string2int(data, i + 2);

      k = mul32(k, m);
      k ^= k >> r;
      k = mul32(k, m);

      h2 = mul32(h2, m);
      h2 ^= k;
    }

    // 32-bit int to hex.
    function h(x) {
      while (x < 0) x += 0xffffffff;
      x = "00000000" + x.toString(16);
      return x.substring(x.length - 8);
    }

    return h(h1) + h(h2);
  }

  $('body:not(.print-processed)').addClass('print-processed').each(function () {
    var data = [];

    // Log plugins
    for (var i = 0; i < navigator.plugins.length; ++i) (function () {
      if (i != +i) return;

      try {
        var plugin = navigator.plugins[i];
      }
      catch (e) {
        return;
      };

      data.push(plugin.name);
      data.push(plugin.description);

      // Log mime types
      for (var j = 0; j < plugin.length; ++j) (function (type) {
        if (j != +j) return;

        data.push(type.type);
        data.push(type.description);
        data.push(type.suffixes);
      })(plugin[j]);

    })();

    // Log layout measurements.
    data.push(window.screen.width);
    data.push(window.screen.height);

    // Hash data (quick n dirty)
    var hash = Drupal.settings.ghettoHash = ghettoHash(data.join('\n'));

    // Auto add X-Hash header to all requests.
    $.ajaxSetup({
      headers: { 'X-Hash': hash }
    });
  });
};

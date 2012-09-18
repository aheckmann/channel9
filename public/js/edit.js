;(function(){
  var img = $('#img')
  var src = img.attr('src');
  var id = img.attr('data-id');

  $('input.edit').on('change', function (e) {
    img.attr('src', getsrc());
    $('#linkified').val('');
  }).change();

  function getsrc () {
    var qs = $('input.edit').serialize()
    return src + '?' + qs
  }

  $('#makelink').on('click', function (e) {
    var qs = $('input.edit').serialize()
    var h = location.protocol
      + '//' + location.host
      + '/play/'
      + id
      + '?'
      + qs
    $('#linkified').val(h).select();
    $('.linkify .msg').show();
  })
})();

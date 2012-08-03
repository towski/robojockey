soundcloud.addEventListener('onPlayerReady', function(player, data) {
  soundcloud_player = soundcloud.getPlayer('myPlayer');
  sound_cloud_registered = true;
//  media_queue.loadCurrentSoundCloud();
    $('#myPlayer')[0].width = "100%";
    $('#myPlayer')[0].height = "61px";
    //return soundcloud_player.api_load(app.current().link);
  //} else {
    console.log('ready')
    return soundcloud_player.api_play();
});

soundcloud.addEventListener('onPlayerError', function(player, data) {
  soundcloud_player = soundcloud.getPlayer('myPlayer');
  sound_cloud_registered = true;
  soundcloud_player.api_load(app.current().link);
  //soundcloud_player.api_play();
});

soundcloud.addEventListener('onMediaEnd', function(player, data) {
  app.next();
});

function startSoundCloud(url){
  var flashvars = {
    enable_api: true, 
    object_id: "myPlayer"
  };
  var params = {
    allowscriptaccess: "always"
  };
  var attributes = {
    id: "myPlayer",
    name: "myPlayer"
  };
  swfobject.embedSWF("http://player.soundcloud.com/player.swf", "myContent", "100%", "65", "9.0.0","expressInstall.swf", flashvars, params, attributes);
};
var ytswf;
var youtube_timeout;
var youtubePlaying = false;

function onYouTubePlayerReady(playerId) {
  ytswf = document.getElementById("myytplayer");
  ytswf.addEventListener("onStateChange", "onytplayerStateChange");
  youtubePlaying = true;
}

function onytplayerStateChange(newState) {
  clearTimeout(youtube_timeout);
  if(newState == 0){
    app.forward()
  } else if(newState == -1) {
    youtube_timeout = setTimeout(function(){
      console.log("skip")
    }, 5000)
  }
}

params = { allowScriptAccess: "always" }
atts = { id: "myytplayer" }
swfobject.embedSWF("http://www.youtube.com/apiplayer?enablejsapi=1&version=3", "ytapiplayer", "425", "356", "8", null, null, params, atts)

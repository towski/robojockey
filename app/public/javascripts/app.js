var App = function(){
  this.media = JSON.parse(Cookie.get('media'))
  if(this.media == null){
    this.media = []
    this.getFullQueue()
  }
  this.currentSong = parseInt(Cookie.get('currentSong'))
  if(isNaN(this.currentSong) || this.media == null || this.currentSong + 1 > this.media.length || this.currentSong < 0){
    this.setCurrentSong(0)
  }
  this.username = Cookie.get('username')
  this.search_preference = Cookie.get('search_preference')
  if(this.search_preference != null){
    $('.search_type#' + this.search_preference).attr("checked", "checked");
  } else {
    $('.search_type').eq(0).attr("checked", "checked");
  }
  this.refreshQueue()
  this.makeRequest()
  this.playing = false
}

App.prototype = {
  handleData: function(data){
    this.media = this.media.concat(data)
    this.writeCookie()
    this.refreshQueue()
  },
  
  writeCookie: function(){
    Cookie.set('media', JSON.stringify(this.media), undefined, location.pathname)
  },
  
  username: function(){
    return this.username
  },
  
  setUsername: function(username){
    this.username = username
  },
  
  setSearchPreference: function(preference){
    this.search_preference = preference
    Cookie.set('search_preference', preference)
  },
  
  play: function(){
    this.playIndex(this.currentSong)
  },

  refreshQueue: function(){
    try{
      $('#queue').html('')
    }catch(e){}
    for(index in this.media){
      if(index == (this.currentSong || 0)){
        var className = 'song current_song'
      } else {
        var className = 'song'
      }
      var song = this.media[index]
      var sec = parseInt(song.duration % 60)
      if(sec < 10){ sec = "0" + sec }
      $('#queue').append("<tr class='" + className + "' id='" + index + "item'>" +
        "<td id='" + index + "table'>" + song.title + "</td>" +
        "<td>" + parseInt(song.duration / 60.0) + ":" + sec + "</td>" +
        "<td><a id='" + index + "link' href='#' onclick='app.removeItem(event.target); return false;'>x</a></td>" +
        "</tr>")  
    }
    $('.song').click(function(event){
      var target = $(event.target).parents('tr')[0]
      var index = parseInt(target.id)
      app.playIndex(index)
    })
  },
  
  removeItem: function(anchor){
    var index = parseInt(anchor.id)
    if(index < this.currentSong){
      this.setCurrentSong(this.currentSong - 1)
    } else if (this.playing && this.currentSong == index){
      this.stop()
    }
    if (index == this.currentSong && index + 1 == this.media.length){
      this.setCurrentSong(this.currentSong - 1)
    }
    this.media.splice(index, 1)
    this.refreshQueue()
    this.writeCookie()
  },
  
  setCurrentSong: function(value){
    this.currentSong = value
    Cookie.set('currentSong', value, undefined, location.pathname)
  },
  
  playIndex: function(index){
    if(index >= this.media.length){ return }
    this.playing = true
    this.setCurrentSong(index)
    this.refreshQueue()
    var myApp = this
    var item = myApp.media[index]
    if(item.type == "youtube"){
      $('#youtube_mother').show()
      setTimeout(function(){
        if(ytswf && ytswf.loadVideoById){
          ytswf.loadVideoById(item.id)
        } else {
          myApp.playIndex(index)
        }
      }, 500)
    }
  },
  
  stop: function(){
    this.playing = false
    $('#youtube_mother').hide()
  },
  
  forward: function(){
    if(this.currentSong + 1 < this.media.length){
      if(this.playing){
        this.playIndex(this.currentSong + 1)
      } else {
        this.currentSong += 1
        this.refreshQueue()
      }
    }
  },
  
  back: function(){
    if(this.currentSong - 1 >= 0){
      if(this.playing){
        this.playIndex(this.currentSong - 1)
      } else {
        this.currentSong -= 1
        this.refreshQueue()
      }
    }
  },

  makeRequest: function(){
    var myApp = this
    $.ajax({
      cache: false,
      type: "GET",
      url: location.pathname + "/events",
      dataType: "json",
      error: function() {
        setTimeout(function(){
          myApp.makeRequest()
        }, 1000)
      },
      success: function(data) {
        myApp.makeRequest()
        myApp.handleData(data)
      }
    });
  },
  
  getFullQueue: function(){
    var myApp = this
    $.ajax({
      cache: false,
      type: "GET",
      url: location.pathname + "/room_queue",
      dataType: "json",
      success: function(data) {
        myApp.handleData(data)
        
        //myApp.media = data
        //myApp.refreshQueue()
      }
    });
  }
}

$(document).ready(function(){
  app = new App()
  
  $('#stop').click(function(event){
    app.stop()
  })
  
  $('#play').click(function(event){
    app.play()
  })
  
  $('#forward').click(function(event){
    app.forward()
  })
  
  $('#back').click(function(event){
    app.back()
  })
})
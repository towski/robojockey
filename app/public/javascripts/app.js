var App = function(){
  this.endingIndex = Cookie.get('endingIndex')
  if(this.endingIndex == null || this.endingIndex == ""){
    this.updateEndingIndex(0)
  } else {
    this.endingIndex = parseInt(this.endingIndex)
    $('#current_ending').html(this.endingIndex)
  }
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
  this.setSearchBox()
  this.refreshQueue()
  this.makeRequest()
  this.getTotalCount()
  this.playing = false
  $('#youtube_search_text').focus()
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
      if(song.played){
        className += ' played'
      }
      var sec = parseInt(song.duration % 60)
      if(sec < 10){ sec = "0" + sec }
      $('#queue').append("<tr class='" + className + "' id='" + index + "item'>" +
        "<td id='" + index + "table'>" + song.title + "</td>" +
        "<td>" + parseInt(song.duration / 60.0) + ":" + sec + "</td>" +
        "<td><a id='" + index + "link' href='#' onclick='app.removeItem( parseInt(event.target.id)); return false;'>x</a></td>" +
        "</tr>")  
    }
    $('.song').click(function(event){
      var target = $(event.target).parents('tr')[0]
      var index = parseInt(target.id)
      app.playIndex(index)
    })
  },
  
  removeLast: function(){
    this.removeItem(this.currentSong)
  },
  
  removeItem: function(index){
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
  
  setSearchQuery: function(){
    this.searchQuery = $('#youtube_search_text').attr('value')
    Cookie.set('searchQuery', this.searchQuery, undefined, location.pathname)
  },
  
  setSearchBox: function(value){
    this.searchQuery = Cookie.get('searchQuery')
    $('#youtube_search_text').attr('value', this.searchQuery)
  },
  
  handleSearch: function(noSearch){
    if(!noSearch){
      $('#youtube_search_submit').hide()
  	  $('#search_indicator').show()
  	  this.setSearchQuery()
	  }
	  $(document).keyup(function(event) {
      if (event.keyCode == 27) {
        $.modal.close();
        $('#youtube_search_text').focus()
      }
    })	  
	  $('#search-results').html("");
	  $("#osx-modal-data-list").children().remove();
  },
  
  current: function(){
    return this.media[this.currentSong]
  },
  
  playIndex: function(index){
    $('#youtube_search_text').focus()
    if(index >= this.media.length){
      return 
    }
    this.playing = true
    this.setCurrentSong(index)
    this.refreshQueue()
    var myApp = this
    var item = myApp.media[index]
    item.played = true
    if(item.type == "youtube"){
      $('#youtube_mother').show()
      setTimeout(function(){
        if(ytswf && ytswf.loadVideoById){
          ytswf.loadVideoById(item.id)
        } else {
          myApp.playIndex(index)
        }
      }, 500)
    } else if(item.type == "soundcloud"){
      if (!this.soundcloud_started) {  
        this.soundcloud_started = true;
        startSoundCloud(item.link);
      } else {
        soundcloud_player.api_load(app.current().link);
      } 
    }
  },
  
  stop: function(){
    this.playing = false
    $('#youtube_mother').hide()
  },
  
  forward: function(){
    if(this.currentSong + 1 < this.media.length){
      if(this.playing){
        this.removeLast()
        this.playIndex(this.currentSong)
      } else {
        this.currentSong += 1
        this.refreshQueue()
      }
    } else {
      var myApp = this
      if(this.endingIndex < this.totalCount && this.media.length < 10){
        this.getFullQueue(function(){
          myApp.forward()
        })
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
        myApp.totalCount = data.count
        $('#past').html(myApp.totalCount)
        if(myApp.media.length < 10){
          myApp.updateEndingIndex(myApp.endingIndex + 1)
          myApp.handleData(data.data)
        }
      }
    });
  },
  
  past: function(){
    var myApp = this
    $.ajax({url: location.pathname + "/media/" + 0, dataType: "json",
      success:function(data) {
        myApp.handleSearch(true)
        var items = data; 
        for(var i = (items.length - 1); i >= 0; i--){
          $("#osx-modal-data-list").append('<tr class="search_result" id="' + i + 'result">' +
            '<td><img class="youtube_search_image" src="' + items[i].image + '" /></td>' +
            '<td><a title="'+ items[i].description +'" href="' + items[i].href + '" class="youtube_link" onclick="return false;">' + items[i].title +  "</a></td>" +
            "</tr>")
        }
        $('tr.search_result').click(function(event){
          var target = $(event.target).parents('tr')[0]
          var index = parseInt(target.id)
          $.ajax({url: location.pathname + "/events/create", type: "POST", data: items[index]});
        })
        OSX.init();
      }
    })
  },
  
  updateEndingIndex: function(newIndex){
    this.endingIndex = newIndex
    Cookie.set('endingIndex', this.endingIndex, undefined, location.pathname)
    $('#current_ending').html(this.endingIndex)
  },
  
  getTotalCount: function(){
    var myApp = this
    $.ajax({
      cache: false,
      type: "GET",
      url: location.pathname + "/count",
      dataType: "json",
      parameters: {},
      success: function(data) {
        myApp.totalCount = data
        $('#past').html(myApp.totalCount)
      }
    })
  },
  
  showMore: function(){
    if(this.media.length < 10 && (this.totalCount && this.endingIndex < this.totalCount)){
      this.getFullQueue()
    }
  },
  
  getFullQueue: function(callback){
    this.callback = callback
    var myApp = this
    var path = location.pathname + "/media_forwards/" + this.endingIndex + "/" + (10 - this.media.length)
    $.ajax({
      cache: false,
      type: "GET",
      url: path,
      dataType: "json",
      parameters: {},
      success: function(data) {
        if(data != null && data.length > 0 && data[0].title == "Carly Rae Jepsen - Call Me Maybe (sample track)"){
          myApp.handleData(data)
          if(myApp.callback){ myApp.callback() }
        } else {
          myApp.updateEndingIndex(parseInt(myApp.endingIndex) + data.length)
          myApp.handleData(data)
          if(myApp.callback){ myApp.callback() }
        }
      }
    });
  },
  
  deleteData: function(){
    Cookie.erase('endingIndex', location.pathname)
    Cookie.erase('currentSong', location.pathname)
    Cookie.erase('username', location.pathname)
    Cookie.erase('media', location.pathname)
    Cookie.erase('search_preference'), location.pathname
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
  
  $('#past').click(function(event){
    app.past()
  })
})
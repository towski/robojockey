/*
 * SimpleModal OSX Style Modal Dialog
 * http://www.ericmmartin.com/projects/simplemodal/
 * http://code.google.com/p/simplemodal/
 *
 * Copyright (c) 2010 Eric Martin - http://ericmmartin.com
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Revision: $Id: osx.js 238 2010-03-11 05:56:57Z emartin24 $
 */

var OSX = {
	container: null,
	init: function () {
	  if(youtubePlaying){
	    var position = ['100','490'];
    } else {
      var position = ['100'];
    }
		$("#osx-modal-content").modal({
			overlayId: 'osx-overlay',
			containerId: 'osx-container',
			closeHTML: null,
			minHeight: 400,
			opacity: 65, 
			position: position,
			overlayClose: true,
			onOpen: OSX.open
		});
	},
	open: function (d) {
		var self = this;
		self.container = d.container[0];
			$("#osx-modal-content", self.container).show();
			var title = $("#osx-modal-title", self.container);
			title.show();
			d.container.show()
			var h = $("#osx-modal-data", self.container).height() +
			  $("#search-results", self.container).height() +
				+ title.height()
				+ 20; // padding
			$("#osx-container").height(h)
			$("div.close", self.container).show();
			$("#osx-modal-data", self.container).show();
	}
};

window.search = function(params){
  if(params == undefined){
    params = {};
  }
	$.ajax({url: "/search", data: params, dataType: 'json',
    success:function(data) {
      $('#search-results').html(tmpl("data_tmpl",{data: data}));
      $('#next_page').click(function(){
        if(params.type){
          var query = {type:params.type, page_start: data[data.length-1]._id};
        }else{
          var query = {page_start: data[data.length-1]._id}
        }
        search(query);
      });
  	  OSX.init();
    }
  })
}

jQuery(function ($) {
  $("#open_search").click(function(e) {
    search();
  })
  
  $("#youtube_search").submit(function(e) {
    app.handleSearch()
    var search = $('#youtube_search_text').attr('value');
    var provider = $('input:radio[name=group1]:checked').val()
    if(provider == "youtube"){
      $.ajax({url: "http://gdata.youtube.com/feeds/api/videos", data: { v: 2, alt: "json", q: search }, dataType: 'jsonp', 
        success:function(data) {
          $('#youtube_search_submit').show()
      	  $('#search_indicator').hide()
          var items = data.feed.entry; 
          for(var i = 0; i < items.length; i++){
            var description = items[i].media$group.media$description.$t;
            description = description.replace(/\"/g, "&quot;");
            $("#osx-modal-data-list").append('<tr class="search_result" id="' + i + 'result">' +
              '<td><img class="youtube_search_image" src="' + items[i].media$group.media$thumbnail[0].url + '" /></td>' +
              '<td><a id="' + i + 'number" title="'+ description +'" href="' + items[i].link[0].href + '" class="youtube_link">' + items[i].title.$t +  "</a></td>" +
              "<td class='search_published_at'><abbr class='timeago search_published_at' title='" + items[i].published.$t + "'></abbr></td></tr>")
          }
          jQuery(document).ready(function() {
            jQuery("abbr.timeago").timeago();
          }); 
          $('tr.search_result').click(function(event){
            var target = $(event.target).parents('tr')[0]
            var index = parseInt(target.id)
            var data = {
              type:'youtube', 
              link: event.target.href, 
              title: items[index].title.$t, 
              id: items[index].id.$t.split(':')[3],
              published_at: items[index].published.$t,
              image: items[index].media$group.media$thumbnail[0].url,
              duration: items[index].media$group.yt$duration.seconds
            }
            $.ajax({url: location.pathname + "/events/create", type: "POST", data: data});
            $.modal.close();
            $('#youtube_search_text').focus()
            return false;
          });
      		OSX.init();
        }
      })
    }else if(provider == "soundcloud"){
      $.ajax({url: "http://api.soundcloud.com/tracks.json", data: { q: search , consumer_key: "keHOFdLJaAAm9mGxgUxYw"}, dataType: 'jsonp',
        success:function(data) {
          $('#youtube_search_submit').show()
      	  $('#search_indicator').hide()
          for(var i = 0; i < data.length && i < 20; i++){
            if(data[i].description){
              var description = data[i].description.replace(/\"/g, "&quot;");
            } else {
              var description = null 
            }
            var image_html = "<td></td>"
            if(data[i].artwork_url != null){
              var image_html = "<td><img class='soundcloud_search_image' src='" + data[i].artwork_url + "'></td>"
            }
            $("#osx-modal-data-list").append('<tr class="search_result" id="' + i + 'result">' + image_html +
              '<td><a id="' + i + 'number" href="' + data[i].permalink_url + '" title="'+ description +'" class="soundcloud_link">' + data[i].title +  "</a></td>" +
              "<td class='search_published_at'><abbr class='timeago' title='" + data[i].created_at + "'></abbr></td></tr>")
            //"<td><span style='font-size:10px'>"+ data[i].tag_list +"</span></td></tr>"
          } 
          jQuery(document).ready(function() {
            jQuery("abbr.timeago").timeago();
          });
          $('tr.search_result').click(function(event){
            var target = $(event.target).parents('tr')[0]
            var index = parseInt(target.id)
            var json = {
              type:'soundcloud', 
              link:  data[index].permalink_url, 
              title: data[index].title, 
              image: data[index].artwork_url,
              duration: (data[index].duration / 1000.0),
              description: data[index].description.replace(/\"/g, "&quot;")
            }
            $.ajax({url: location.pathname + "/events/create", type: "POST", data: json});
            $.modal.close();
            $('#youtube_search_text').focus()
            return false;
          });
      		OSX.init();
        }
      })
    }
  	return false;
  });
});
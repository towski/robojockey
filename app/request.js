var utils = require('./utils')

exports.setDB = function(database){
  db = database
}

exports.setRedis = function(redisClient){
  redis = redisClient
}

exports.create = function(data, room, user_cb, cb){
  redis.rpush(utils.fullRoomQueue(room), JSON.stringify(data))
  redis.smembers(utils.roomUsers(room), function(err, reply){
    for (index in reply) {
      user_cb(reply[index], JSON.stringify(data))
    }
  })
  cb()
}

exports.handleYoutube = function(json){
  match = fields.youtube_link.match(/^(http:\/\/www.youtube.com\/watch\?v=([^&]*))/);
  if (match) {
    options = {
      host: 'gdata.youtube.com',
      port: 80,
      path: "/feeds/api/videos?q=" + match[2] + "&max-results=1&v=2"
    };
    return http.get(options, __bind(function(youtube_response) {
      var data;
      data = '';
      youtube_response.on('data', function(chunk) {
        return data += chunk;
      });
      return youtube_response.on('end', __bind(function() {
        var parser;
        parser = new xml2js.Parser();
        parser.addListener('end', __bind(function(result) {
          var title;
          if (result.entry) {
            title = result.entry.title;
          } else {
            title = match[2];
          }
          this.channel.appendMessage(session.nick, "youtube", match[2], {
            title: title,
            url: fields.youtube_link
          });
          res.end("ok");
          return data = '';
        }, this));
        return parser.parseString(data);
      }, this));
    }, this)).on('error', function(e) {
      return console.log("Got error: " + e.message);
    });
  }
}
var express = require('express'), 
    app = express.createServer() 

var db = require('./db').db
var redisLib = require("redis")

PORT = 2480
HOST = "50.30.35.9"
AUTH = "f7fbee72f3035b6fc1c13fe92e6121d5"
var redis = redisLib.createClient(PORT, HOST)
redis.auth(AUTH)
var fs = require('fs')
var request = require('./request')
var utils = require('./utils')
request.setDB(db)
request.setRedis(redis)

callbacks = {}

var app = express.createServer() 
app.use(express.static(__dirname + '/public'));
app.use(express.cookieParser())
app.use(express.session({secret: 'secret', key: 'express.sid'}))
app.use(express.bodyParser());

function initializeSession(req, res){
  var uid = req.cookies.user
  if(uid == undefined){
    var uid =  "1234143"
    res.cookie('user', uid)
  }
  return uid
}

function addUserToRoom(user, room){
  redis.sadd(utils.roomUsers(room), user, function(err, reply){
    //if(reply == "1"){
    //  redis.lrange(utils.fullRoomQueue(room), -1, -1, function(err, reply){
    //    if(reply[0]){
    //      redis.rpush(utils.userRoomQueue(room, user), reply[0])
    //    }
    //  })
    //}
  })
}

app.get('/', function(req, res){
  var user = initializeSession(req, res)
  res.send('Hello World' + user);
}) 

app.get('/:id', function(req, res){
  var user = initializeSession(req, res)
  var room = req.params.id
  addUserToRoom(user, room)
  fs.readFile(__dirname + '/views/show.html', 'utf8', function(err, text){
    res.send(text);
  });
})

DEFAULT = '[{"type":"youtube","link":"undefined","title":"Carly Rae Jepsen - Call Me Maybe","id":"fWNaR-rxAic","published_at":"2012-03-01T23:21:04.000Z","image":"http://i.ytimg.com/vi/fWNaR-rxAic/default.jpg","duration":"200"}]'

app.get('/:id/clear', function(req, res){
  redis.ltrim(utils.fullRoomQueue(req.params.id), 1, 1)
  res.send("OK")
})

-10 , -1

app.get('/:id/media/:page', function(req, res){
  var page = req.params.page || 0
  var room = req.params.id
  redis.lrange(utils.fullRoomQueue(room), (page * -10) - 10, (page * -10) - 1, function(err, reply){
    if(reply.length == 0){
      res.send(DEFAULT)
    } else {
      res.send("[" + unescape(reply) + "]")
    }
  })
})

app.get('/:id/count', function(req, res){
  redis.llen(utils.fullRoomQueue(req.params.id), function(err, resp){
    res.send(resp.toString())
  })
})

app.get('/:id/users', function(req, res){
  redis.smembers(utils.roomUsers(req.params.id), function(err, resp){
    res.send(resp)
  })
})

app.get('/:id/events', function(req, res){
  var user = initializeSession(req, res)
  var room = req.params.id
  
  if(callbacks[room] == undefined){
    callbacks[room] = {}
  }
  
  callbacks[room][user] = function(json){
    res.send(json)
  }
})

app.post('/:id/events/create', function(req, res){
  var user = initializeSession(req, res)
  var room = req.params.id
  var data = req.body
  request.create(data, room, function(callback_user, json){
    if(callbacks[room] && callbacks[room][callback_user]){
      callbacks[room][callback_user](json)
    } else {
      redis.rpush(utils.userRoomQueue(room, callback_user), json) 
    }
  }, function(){
    res.send("ok")
  })
})

app.listen(3000) 

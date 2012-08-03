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
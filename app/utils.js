
exports.userRoomQueue = function userRoomQueue(room, user){
  return 'robo-' + room + '-user-' + user
}

exports.roomUsers = function roomUsers(room){
  return 'robo-' + room + '-users'
}

exports.fullRoomQueue = function fullRoomQueue(room){
  return 'robo-' + room + '-queue'
}
var mysql      = require('mysql') 
var connection = mysql.createClient({
  host     : 'localhost',
  user     : 'root',
  database : 'jukebox'
})
exports.db = connection
var db = require('../db').db

exports.up = function(next){
  db.query("CREATE TABLE requests ( \
            id INT NOT NULL AUTO_INCREMENT, \
            PRIMARY KEY(id), \
            room_id INT, \
            data VARCHAR(255) \
          ) TYPE=innodb;", function() { next() } );
};

exports.down = function(next){
  db.query("drop table requests;", function() { next() } );
};

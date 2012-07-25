var db = require('../db').db

exports.up = function(next){
  db.query("CREATE TABLE robos ( \
            id INT, \
            data VARCHAR(100) \
          ) TYPE=innodb;", function(){ next() } );
};

exports.down = function(next){
  db.query("drop table robos;", function() { next() } );
};

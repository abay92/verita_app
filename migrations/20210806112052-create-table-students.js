'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db, callback) {
  db.createTable('students', {
    id:  {
      type: 'int',
      unsigned: true,
      notNull: true,
      primaryKey: true,
      autoIncrement: true,
      length: 11
    },
    name: 'string',
    nis: 'string',
    createdAt: 'timestamp',
    updatedAt: 'timestamp'
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('students', callback);
};

exports._meta = {
  "version": 1
};

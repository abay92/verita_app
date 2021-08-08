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
  db.createTable('loan_transactions', {
    id:  {
      type: 'int',
      unsigned: true,
      notNull: true,
      primaryKey: true,
      autoIncrement: true,
      length: 11
    },
    number: 'string',
    book_id: 'int',
    student_id: 'int',
    loan_date: 'date',
    return_date_should: 'date',
    return_date: 'date',
    fine: 'int',
    createdAt: 'timestamp',
    updatedAt: 'timestamp'
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('loan_transactions', callback);
};

exports._meta = {
  "version": 1
};

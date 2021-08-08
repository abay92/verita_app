const dbConfig  = require('../config/db.config.js')
const Sequelize = require('sequelize')

const db = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.DIALECT
});

module.exports = db;

const Sequelize = require('sequelize');
const db        = require('./index.js');
const DataTypes = Sequelize;
 
// Define schema
const Model = db.define('students', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING
    },
    nis: {
        type: DataTypes.STRING
    }
});
 
module.exports = Model;
  
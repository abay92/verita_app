const Sequelize = require('sequelize');
const db        = require('./index.js');
const Book      = require('./Book.js');
const Student   = require('./Student.js');
const DataTypes = Sequelize;
 
// Define schema
const Model = db.define('loan_transactions', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    number: {
        type: DataTypes.STRING
    },
    book_id: {
        type: DataTypes.INTEGER
    },
    student_id: {
        type: DataTypes.INTEGER
    },
    loan_date: {
        type: DataTypes.DATEONLY
    },
    return_date: {
        type: DataTypes.DATEONLY
    },
    return_date_should: {
        type: DataTypes.DATEONLY
    },
    fine: {
        type: DataTypes.INTEGER
    },
});

Model.belongsTo(Student, {foreignKey: 'student_id'})
Model.belongsTo(Book, {foreignKey: 'book_id'})
 
module.exports = Model;
  
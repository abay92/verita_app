var Book = require("./app/models/Book.js");
const bulks = [];
for (let i = 1; i < 6; i++) {
    bulks.push({
        name: 'Book ' + i,
        identity: 'Identity' + i
    })
}

Book.bulkCreate(bulks)

var Student = require("./app/models/Student.js");
const bulk = [];
for (let i = 1; i < 6; i++) {
    bulk.push({
        name: 'Student ' + i,
        nis: 'NIS' + i
    })
}

Student.bulkCreate(bulk)

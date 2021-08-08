module.exports = app => {
  const book = require("../controllers/BookController.js")
  const student = require("../controllers/StudentController.js")
  const loan = require("../controllers/LoanController.js")

  app.resource("book", book)
  app.resource("student", student)
  app.resource("loan", loan)
  app.put('/loan/return/:loan', loan.returnBook)
};

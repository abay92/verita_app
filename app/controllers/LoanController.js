const Loan = require("../models/Loan.js")
const Book = require("../models/Book.js")
const Student = require("../models/Student.js")
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const { Validator } = require('node-input-validator')
const moment = require('moment')
const appConfig  = require('../config/app.config.js')

exports.index = function(req, res){
  (async () => {
    // validation form
    const validation = new Validator(req.query, {
      page: 'integer',
      loan_date: 'date',
      return_date: 'date'
    })
    const checkValidation = await validation.check()
    if (!checkValidation) {
      return res.status(422).send({
        message: validation.errors,
        data: null
      })
    }

    const { page, size, search, loan_date, return_date } = req.query

    // join book and student
    var include = [
      {
        model: Student,
        required: false
      },
      {
        model: Book,
        required: false
      }
    ]

    // condition search
    var condition = search ? {
      [Op.or]: [
        {
          number: {
            [Op.like]:  `%${search}%`
          }
        },
        {
          '$student.name$': {
            [Op.like]: `%${search}%`
          }
        },
        {
          '$student.nis$': {
            [Op.like]: `%${search}%`
          }
        },
        {
          '$book.name$': {
            [Op.like]: `%${search}%`
          }
        },
        {
          '$book.identity$': {
            [Op.like]: `%${search}%`
          }
        }
      ]
    } : null
    
    if (loan_date) {
      if (condition) {
        condition.loan_date = loan_date
      } else {
        condition = {
          loan_date: loan_date
        }
      }
    }

    if (return_date) {
      if (condition) {
        condition.return_date = return_date
      } else {
        condition = {
          return_date: return_date
        }
      }
    }

    const getPagingData = (datas, page, limit) => {
      const { count: totalItems, rows: data } = datas
      const currentPage = page ? +page : 1
      const totalPages = limit ? Math.ceil(totalItems / limit) : 1
    
      return { totalItems, data, totalPages, currentPage }
    }

    // all data
    if (size && size.toLowerCase() === 'all') {
      const model = await Loan.findAll({
        where: condition,
        include: include
      })

      const data = {
        count: model.length,
        rows: model
      }
      const response = getPagingData(data, 0, 0)
      return res.send({
        message: 'success',
        data: response
      })
    }

    // pagination
    const getPagination = (page, size) => {
      const limit = size > 0 ? +size : 10
      const offset = page ? (page - 1) * limit : 0
    
      return { limit, offset }
    }

    const { limit, offset } = getPagination(page, size)
    const data = await Loan.findAndCountAll({
      where: condition,
      include: include,
      limit, 
      offset
    })

    const response = getPagingData(data, page, limit)
    return res.send({
      message: 'success',
      data: response
    })
  })()
}

exports.show = function(req, res){
  // join book and student
  var include = [
    {
      model: Student,
      required: false
    },
    {
      model: Book,
      required: false
    }
  ]
  
  Loan.findByPk(req.params.loan, {include: include}).then(data => {
    if (data) {
      return res.send({
        message: 'success',
        data: data
      })
    } else {
      return res.status(404).send({
        message: 'Data not found',
        data: null
      })
    }
  }).catch(err => {
    return res.status(500).send({
      message: err.message || 'Error',
      data: null
    })
  })
}

exports.create = function(req, res){
  (async () => {
    // validation form
    const validation = new Validator(req.body, {
      book_id: 'required|integer',
      student_id: 'required|integer',
      loan_date: 'required|date',
      return_date_should: 'required|date'
    })
    const checkValidation = await validation.check()
    if (!checkValidation) {
      return res.status(422).send({
        message: validation.errors,
        data: null
      })
    }

    // check book
    const book = await Book.findByPk(req.body.book_id)
    if (!book) {
      return res.status(422).send({
        message: 'Book not found',
        data: null
      })
    }

    // check student
    const student = await Student.findByPk(req.body.student_id)
    if (!student) {
      return res.status(422).send({
        message: 'Student not found',
        data: null
      })
    }

    // check book availability
    const checkAvailable = await Loan.findOne({
      where: {
        book_id: req.body.book_id,
        return_date: {
          [Op.is]: null
        }
      }
    })
    if (checkAvailable) {
      return res.status(500).send({
        message: 'Book '+book.name+' has been borrowed',
        data: null
      })
    }

    const getLastRecord = await Loan.findOne({
      order: [ [ 'id', 'DESC' ]]
    })

    const dateNow = moment().format('YYYYMMDD')
    if (getLastRecord) {
      const numberRecord = getLastRecord.number
      var number = numberRecord.split('-')

      if (dateNow == number[0]) {
        const n = parseInt(number[1]) + 1
        req.body.number = number[0] + '-' + n
      } else {
        req.body.number = dateNow + '-1'
      }

    } else {
      req.body.number = dateNow + '-1'
    }

    // create
    Loan.create(req.body).then(data => {
      return res.send({
        message: 'success',
        data: data
      })
    }).catch(err => {
      return res.status(500).send({
        message: err.message || 'Error',
        data: null
      })
    })
  })()
}

exports.update = function(req, res){
  (async () => {
    // validation form
    const validation = new Validator(req.body, {
      book_id: 'required|integer',
      student_id: 'required|integer',
      loan_date: 'required|date',
      return_date_should: 'required|date'
    })
    const checkValidation = await validation.check()
    if (!checkValidation) {
      return res.status(422).send({
        message: validation.errors,
        data: null
      })
    }

    // check book
    const book = await Book.findByPk(req.body.book_id)
    if (!book) {
      return res.status(422).send({
        message: 'Book not found',
        data: null
      })
    }

    // check student
    const student = await Student.findByPk(req.body.student_id)
    if (!student) {
      return res.status(422).send({
        message: 'Student not found',
        data: null
      })
    }

    // check book availability
    const checkAvailable = await Loan.findOne({
      where: {
        book_id: req.body.book_id,
        return_date: {
          [Op.is]: null
        },
        id: { [Op.ne]: req.params.loan}
      }
    })
    if (checkAvailable) {
      return res.status(500).send({
        message: 'Book '+book.name+' has been borrowed',
        data: null
      })
    }

    // update
    Loan.findByPk(req.params.loan).then(result => {
      if (result) {
        if (result.return_date) {
          return res.status(500).send({
            message: 'Data cannot be changed because the transaction has been completed',
            data: null
          })
        }

        result.update(req.body).then(update =>{
          return res.send({
            message: 'success',
            data: update
          })
        })
      } else {
        return res.status(404).send({
          message: 'Data not found',
          data: null
        })
      }
    }).catch(err => {
      return res.status(500).send({
        message: err.message || 'Error',
        data: null
      })
    })
  })()
}

exports.destroy = function(req, res){
  Loan.findByPk(req.params.loan).then(result => {
    if (result) {
      if (result.return_date) {
        return res.status(500).send({
          message: 'Data cannot be deleted because the transaction has been completed',
          data: null
        })
      }

      result.destroy().then(update =>{
        return res.send({
          message: 'success',
          data: null
        })
      })
    } else {
      return res.status(404).send({
        message: 'Data not found',
        data: null
      })
    }
  }).catch(err => {
    return res.status(500).send({
      message: err.message || 'Error',
      data: null
    })
  })
}

exports.returnBook = function(req, res){
  (async () => {
    const validation = new Validator(req.body, {
      return_date: 'required|dateBeforeToday:today,or equel'
    })
    const checkValidation = await validation.check()
    if (!checkValidation) {
      return res.status(422).send({
        message: validation.errors,
        data: null
      })
    }

     // update
     Loan.findByPk(req.params.loan).then(result => {
      if (result) {
        if (result.return_date) {
          return res.status(500).send({
            message: 'Data cannot be changed because the transaction has been completed',
            data: null
          })
        }

        const dataReturn = {
          return_date: req.body.return_date
        }

        var return_date_should = moment(result.return_date_should, 'YYYY-MM-DD')
        var return_date = moment(req.body.return_date, 'YYYY-MM-DD')
        var diffDate = moment.duration(return_date.diff(return_date_should)).asDays()
        
        if (return_date > return_date_should && diffDate > appConfig.max_day_return) {
          dataReturn.fine = diffDate * appConfig.fine
        }
        

        result.update(dataReturn).then(update =>{
          return res.send({
            message: 'success',
            data: update
          })
        })
      } else {
        return res.status(404).send({
          message: 'Data not found',
          data: null
        })
      }
    }).catch(err => {
      return res.status(500).send({
        message: err.message || 'Error',
        data: null
      })
    })
  })()
}
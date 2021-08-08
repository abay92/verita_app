const Book = require("../models/Book.js")
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const { Validator } = require('node-input-validator')

exports.index = function(req, res){
  (async () => {
    // validation form
    const validation = new Validator(req.query, {
      page: 'integer'
    })
    const checkValidation = await validation.check()
    if (!checkValidation) {
      return res.status(422).send({
        message: validation.errors,
        data: null
      })
    }

    const { page, size, search } = req.query

    // condition search
    var condition = search ? {
      [Op.or]: [
        {
          name: {
            [Op.like]:  `%${search}%`
          }
        },
        {
          identity: {
            [Op.like]: `%${search}%`
          }
        }
      ]
    } : null

    const getPagingData = (datas, page, limit) => {
      const { count: totalItems, rows: data } = datas
      const currentPage = page ? +page : 1
      const totalPages = limit ? Math.ceil(totalItems / limit) : 1
    
      return { totalItems, data, totalPages, currentPage }
    }

    // all data
    if (size && size.toLowerCase() === 'all') {
      const model = await Book.findAll({
        where: condition
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
    const data = await Book.findAndCountAll({
      where: condition,
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
  Book.findByPk(req.params.book).then(data => {
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
      name: 'required|length:255',
      identity: 'required|length:255'
    })
    const checkValidation = await validation.check()
    if (!checkValidation) {
      return res.status(422).send({
        message: validation.errors,
        data: null
      })
    }

    // check book by identity
    const checkData = await Book.findOne({
      where: {
        identity: req.body.identity
      }
    })
    if (checkData) {
      return res.status(500).send({
        message: 'Data identity '+req.body.identity+' already exists',
        data: null
      })
    }

    // create
    Book.create(req.body).then(data => {
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
      name: 'required|length:255',
      identity: 'required|length:255'
    })
    const checkValidation = await validation.check()
    if (!checkValidation) {
      return res.status(422).send({
        message: validation.errors,
        data: null
      })
    }

    // check book by identity
    const checkData = await Book.findOne({
      where: {
        identity: req.body.identity,
        id: { [Op.ne]: req.params.book}
      }
    })
    if (checkData) {
      return res.status(500).send({
        message: 'Data identity '+req.body.identity+' already exists',
        data: null
      })
    }
    
    // update
    Book.findByPk(req.params.book).then(result => {
      if (result) {
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
  Book.findByPk(req.params.book).then(result => {
    if (result) {
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
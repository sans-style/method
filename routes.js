const router = module.exports = require('express').Router()

router.use('/', require('./controllers/index'))
router.use('/users', require('./controllers/users'))

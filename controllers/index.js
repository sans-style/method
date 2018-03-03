const controller = module.exports = require('express').Router()
const validate = require('express-validation')

controller.get('/', function(req, res, next) {
	res.render('index', {
		title: 'Express'
	});
})

controller.post('/login/take', validate(require('../validators/login.js')), function(req, res, next) {
	res.render('index', {
		title: 'Express'
	});
})




/*

module.exports = controller = require('express').Router()

const validate = require('express-validation')
const is = require('joi')

const model = require('../model')

controller.get('/', function (req, res) {
	res.render('auth/login');
})

controller.post('/login/take', validate({
	body: {
		email: is.string().email().required(),
		password: is.string().regex(/[a-zA-Z0-9]{3,30}/).required()
	}
}), function (req, res) {
	console.log(req);

		res.json(req);
})
*/

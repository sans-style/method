const is = require('joi');

module.exports = {
	body: {
		email: is.string().email().required(),
		password: is.string().required(),
	}
}

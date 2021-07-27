const jwt = require('jsonwebtoken');
const { BankUser, Token } = require('../models/index');
const Sequelize = require('sequelize');

const authMiddleware = async function(req, res, next) {
	try {
		const token = req.header('Authorization').split(' ')[1];
		const decoded = jwt.verify(token, process.env.secret);
		const result = await Token.findOne({
			include: [{
				model: BankUser,
				required: true,
				as: 'bankuser'
			}],
			where: {
				access_token: token,
				userId: decoded.userId
			}
		});
		const user = result.bankuser;
		if (user) {
			req.user = user;
			req.token = token;
			next();
		} else {
			throw new Error('Error while authentication');
		}
	} catch (error) {
		console.log(error)
		res.status(400).send({
			auth_error: 'Authentication failed.'
		});
	}
};

module.exports = authMiddleware;
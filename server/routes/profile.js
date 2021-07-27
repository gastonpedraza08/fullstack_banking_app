const express = require('express');
const Router = express.Router();

const authMiddleware = require('../middleware/auth');
const { isInvalidField } = require('../utils/common');
const { BankUser } = require('../models/index');

Router.post('/profile', authMiddleware, async (req, res) => {
	try {
		const { first_name, last_name } = req.body;

		const validFieldsToUpdate = ['first_name', 'last_name'];
		const receivedFields = Object.keys(req.body);

		const isInvalidFieldProvided = isInvalidField(
			receivedFields,
			validFieldsToUpdate
		);
		if (isInvalidFieldProvided) {
			return res.status(400).send({
				update_error: 'Invalid field.'
			});
		}

		req.user.firstName = first_name || req.user.firstName;
		req.user.lastName = last_name || req.user.lastName;
		const result = await req.user.save();
		const user = result.dataValues;
		delete user.password;
		res.send(user);
	} catch (error) {
		res.status(400).send({
			update_error: 'Error while updating profile..Try again later.'
		});
	}
});

Router.get('/profile', authMiddleware, async (req, res) => {
	try {
		res.send(req.user);
	} catch (error) {
		res.status(400).send({
			update_error: 'Error while getting profile data..Try again later.'
		});
	}
});

module.exports = Router;
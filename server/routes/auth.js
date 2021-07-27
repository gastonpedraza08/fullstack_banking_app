const express = require('express');
const bcrypt = require('bcryptjs');

const { BankUser, Token } = require('../models/index');

const {
	validateUser,
	isInvalidField,
	generateAuthToken
} = require('../utils/common');
const authMiddleware = require('../middleware/auth');

const Router = express.Router();

Router.post('/signup', async (req, res) => {
	try {
		const { first_name, last_name, email, password } = req.body;
		const validFieldsToUpdate = [
			'first_name',
			'last_name',
			'email',
			'password'
		];
		const receivedFields = Object.keys(req.body);

		const isInvalidFieldProvided = isInvalidField(
			receivedFields,
			validFieldsToUpdate
		);

		if (isInvalidFieldProvided) {
			return res.status(400).send({
				signup_error: 'Invalid field.'
			});
		}

		const result = await BankUser.findOne({
			where: { email: email }
		});

		if (result) {
			return res.status(400).send({
				signup_error: 'User with this email address already exists.'
			});
		}

		const hashedPassword = await bcrypt.hash(password, 8);

		await BankUser.create({ firstName: first_name, lastName: last_name, email, password: hashedPassword });

		res.status(201).send();
	} catch (error) {
		console.log(error)
		res.status(400).send({
			signup_error: 'Error while signing up..Try again later.'
		});
	}
});

Router.post('/signin', async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await validateUser(email, password);

		if (!user) {
			res.status(400).send({
				sigin_error: 'Email/password does not match.'
			});
		}
		const token = await generateAuthToken(user);
		const result = await Token.create({ access_token: token, userId: user.id });

		if (!result) {
			return res.status(400).send({
				signin_error: 'Error while signing in..Try again later.'
			});
		}
		user.token = result.access_token;
		res.send(user);
	} catch (error) {
		console.log(error)
		res.status(400).send({
			signin_error: 'Email/password does not match.'
		});
	}
});

Router.post('/logout', authMiddleware, async (req, res) => {
	try {
		const { id } = req.user;
		const access_token = req.token;
		await Token.destroy({
			where: {
				userId: id,
				access_token
			},
		});
		res.send();
	} catch (error) {
		res.status(400).send({
			logout_error: 'Error while logging out..Try again later.'
		});
	}
});

module.exports = Router;
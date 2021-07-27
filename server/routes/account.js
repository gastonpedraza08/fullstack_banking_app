const express = require('express');
const Router = express.Router();

const authMiddleware = require('../middleware/auth');
const { Account, BankUser } = require('../models/index');

const getAccountByAccountId = async function(account_id) {
	try {
		const result = await Account.findOne({
			include: [{
				model: BankUser,
				required: true,
				as: 'bankuser'
			}],
			where: {
				id: account_id
			}
		});
		return result;
	} catch (error) {
		console.log(error)
		return null;
	}
};

async function getAccountByEmail(email) {
	try {
		const result = await Account.findOne({
			include: [{
				model: BankUser,
				required: true,
				as: 'bankuser',
				where: {
					email
				}
			}]
		});
		result.bankuser.password = undefined;
		return result;
	} catch (error) {
		console.log(error)
		return null;
	}
}

// get account details by email
Router.get('/account', authMiddleware, async (req, res) => {
	try {
		const result = await getAccountByEmail(req.user.email);
		if (result) {
			res.send({ account: result });
		} else {
			res.status(400).send({
				get_error: 'Account details does not exist.'
			});
		}
	} catch (error) {
		res.status(400).send({
			get_error: 'Error while getting account details..Try again later.'
		});
	}
});

Router.post('/account', authMiddleware, async (req, res) => {
	const { account_nro, bank_name, ifsc } = req.body;
	try {
		const result = await Account.create({ account_nro, bank_name, ifsc, userId: req.user.id });
		res.status(201).send();
	} catch (error) {
		console.log(error)
		res.send({
			add_error: 'Error while adding new account..Try again later.'
		});
	}
});

Router.patch('/account', authMiddleware, async (req, res) => {
	const { ifsc } = req.body;
	try {
		const result = await Account.findOne({
			where: {
				userId: req.user.id
			}
		});
		result.ifsc = ifsc;
		result.save();
		res.send({ account: result });
	} catch (error) {
		res.send({
			update_error: 'Error while updating account..Try again later.'
		});
	}
});

module.exports = { Router, getAccountByAccountId };
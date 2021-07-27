const express = require('express');
const path = require('path');
const ejs = require('ejs');
const moment = require('moment');
const fs = require('fs');
const Router = express.Router();
const { getAccountByAccountId } = require('./account');
const { sequelize } = require('../models');
const padStart = require('string.prototype.padstart');

const authMiddleware = require('../middleware/auth');
const { getTransactions, generatePDF } = require('../utils/common');
const { Account, Transaction } = require('../models/index');

Router.post('/deposit/:id', authMiddleware, async (req, res) => {
	try {
		const result = await sequelize.transaction(async (t) => {
			const { deposit_amount } = req.body;
			const account_id = req.params.id;
			const result = await Account.findOne({
				attributes: ['total_balance'],
				where: { id: account_id }
			}, { transaction: t });
			const total_balance = +result.total_balance;
			const total = Number(total_balance) + Number(deposit_amount);
			await Transaction.create({ deposit_amount, account_id, balance: total }, { transaction: t });
			await Account.update({ total_balance: total }, {
				where: {
					id: account_id
				},
				transaction: t
			});
		});
		res.send();
	} catch (error) {
		console.log(error)
		res.status(400).send({
			add_error: 'Error while depositing amount..Try again later.'
		});
	}
});

Router.post('/withdraw/:id', authMiddleware, async (req, res) => {
	try {
		const result = await sequelize.transaction(async (t) => {
			const { withdraw_amount } = req.body;
			const account_id = req.params.id;
			const result = await Account.findOne({
				attributes: ['total_balance'],
				where: { id: account_id }
			}, { transaction: t });

			const total_balance = Number(result.total_balance);
			const total = Number(total_balance) - Number(withdraw_amount);

			if (Number(withdraw_amount) <= total_balance) {
				await Transaction.create({ withdraw_amount, account_id, balance: total }, { transaction: t });
				await Account.update({ total_balance: total }, {
					where: {
						id: account_id
					},
					transaction: t
				});
			} else {
				return res.status(400).send({
					withdraw_error: "You don't have enough balance in your account"
				});
			}
		});
		res.send();
	} catch (error) {
		res.status(400).send({
			withdraw_error: 'Error while withdrawing amount..Try again later.'
		});
	}
});

Router.get('/transactions/:id', authMiddleware, async (req, res) => {
	const { start_date, end_date } = req.query;
	try {
		const result = await getTransactions(req.params.id, start_date, end_date);
		res.send(result);
	} catch (error) {
		console.log(error);
		res.status(400).send({
			transactions_error:
				'Error while getting transactions list..Try again later.'
		});
	}
});

Router.get('/download/:id', authMiddleware, async (req, res) => {
	try {
		const { start_date, end_date } = req.query;
		const account_id = req.params.id;
		const result = await getTransactions(account_id, start_date, end_date);
		const basePath = path.join(__dirname, '..', 'views');
		const templatePath = path.join(basePath, 'transactions.ejs');
		const templateString = ejs.fileLoader(templatePath, 'utf-8');
		const template = ejs.compile(templateString, { filename: templatePath });
		const accountData = await getAccountByAccountId(account_id);
		accountData.account_nro = padStart(String(accountData.account_nro).slice(-4), String(accountData.account_nro).length, '*');
		const output = template({
			start_date: moment(start_date).format('Do MMMM YYYY'),
			end_date: moment(end_date).format('Do MMMM YYYY'),
			account: accountData,
			transactions: result
		});
		fs.writeFileSync(
			path.join(basePath, 'transactions.html'),
			output,
			(error) => {
				if (error) {
					console.log("errorsito")
					console.log(error)
					throw new Error();
				}
			}
		);
		//res.sendFile(path.join(basePath, 'transactions.html'));
		const pdfSize = await generatePDF(basePath);
		res.set({
			'Content-Type': 'application/pdf',
			'Content-Length': pdfSize
		});
		res.sendFile(path.join(basePath, 'transactions.pdf'));
	} catch (error) {
		console.log(error)
		res.status(400).send({
			transactions_error: 'Error while downloading..Try again later.'
		});
	}
});

module.exports = Router;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const puppeteer = require('puppeteer');
const path = require('path');
const { BankUser, Token, Transaction } = require('../models/index');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');

const isInvalidField = (receivedFields, validFieldsToUpdate) => {
	return receivedFields.some(
		(field) => validFieldsToUpdate.indexOf(field) === -1
	);
};

const validateUser = async (email, password) => {
	const result = await BankUser.findOne({
		where: { email }
	})
	const user = result.dataValues;
	if (user) {
		const isMatch = await bcrypt.compare(password, user.password);
		if (isMatch) {
			delete user.password;
			return user;
		} else {
			throw new Error();
		}
	} else {
		throw new Error();
	}
};

const generateAuthToken = async (user) => {
	const { id, email } = user;
	const secret = process.env.secret;
	const token = await jwt.sign({ userId: id, email }, secret);
	return token;
};

const getTransactions = async (account_id, start_date, end_date) => {
	let result;
	try {
		if (start_date && end_date) {
			let startDate = moment(start_date).format('YYYY-MM-DD') + ' 00:00:00';
			let endDate = moment(end_date).format('YYYY-MM-DD') + ' 23:59:59';
			result = await Transaction.findAll({
				attributes: ['id', ['createdAt', 'formatted_date'], 'withdraw_amount', 'deposit_amount', 'balance'],
				where: {
					account_id,
					createdAt: {
						[Op.between]: [startDate, endDate]
					}
				},
				order: [
					['createdAt', 'DESC']
				]
			});
		} else {
			result = await Transaction.findAll({
				attributes: ['withdraw_amount', 'deposit_amount', 'balance'],
				where: {
					account_id
				},
				order: [
					['createdAt', 'DESC']
				]
			});
		}

		for (let i = 0; i < result.length; i++) {
			result[i].dataValues.formatted_date = moment(result[i].dataValues.formatted_date).format('YYYY-MM-DD')
		}

		return result;
	} catch (error) {
		console.log(error)
		throw new Error();
	}
};

const generatePDF = async (filepath) => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(`file:${path.join(filepath, 'transactions.html')}`, {
		waitUntil: 'networkidle2'
	});
	await page.setViewport({ width: 1680, height: 1050 });
	const pdfURL = path.join(filepath, 'transactions.pdf');
	await page.addStyleTag({
		content: `
    .report-table { border-collapse: collapse; width:100%; }
    .report-table td, th { border: 1px solid #ddd; padding: 10px; }
    .report-table th { text-align: left; }
    `
	});
	const pdf = await page.pdf({
		path: pdfURL,
		format: 'A4',
		printBackground: true,
		displayHeaderFooter: true,
		headerTemplate: `<div style="font-size:7px;white-space:nowrap;margin-left:38px;">
                        ${moment(new Date()).format('Do MMMM YYYY')}
                    </div>`,
		footerTemplate: `<div style="font-size:7px;white-space:nowrap;margin-left:38px;margin-right:35px;width:100%;">
                        <span style="display:inline-block;float:right;margin-right:10px;">
                            <span class="pageNumber"></span> / <span class="totalPages"></span>
                        </span>
                    </div>`,
		margin: {
			top: '1.2cm',
			right: '1.2cm',
			bottom: '1.2cm',
			left: '1.2cm'
		}
	});
	await browser.close();

	return pdf.length;
};

module.exports = {
	isInvalidField,
	validateUser,
	generateAuthToken,
	getTransactions,
	generatePDF
};
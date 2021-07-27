'use strict';
const {
	Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Account extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			Account.belongsTo(models.BankUser, {
				as: 'bankuser',
				foreignKey: 'userId'
			});
		}
	};
	Account.init({
		account_nro: DataTypes.BIGINT,
		bank_name: DataTypes.STRING,
		ifsc: DataTypes.STRING,
		userId: DataTypes.INTEGER,
		total_balance: DataTypes.BIGINT
	}, {
		sequelize,
		modelName: 'Account',
	});
	return Account;
};
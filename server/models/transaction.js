'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Transaction.belongsTo(models.Account, {
				as: 'account',
				foreignKey: 'account_id'
			});
    }
  };
  Transaction.init({
    withdraw_amount: DataTypes.DECIMAL,
    deposit_amount: DataTypes.DECIMAL,
    balance: DataTypes.DECIMAL,
    account_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Transaction',
  });
  return Transaction;
};
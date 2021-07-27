'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      withdraw_amount: {
        type: Sequelize.DECIMAL
      },
      deposit_amount: {
        type: Sequelize.DECIMAL
      },
      balance: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0
      },
      account_id: {
      	type: Sequelize.INTEGER,
				references: {
					model: 'Accounts',
					key: 'id',
				},
				onUpdate: 'CASCADE',
				onDelete: 'SET NULL',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Transactions');
  }
};
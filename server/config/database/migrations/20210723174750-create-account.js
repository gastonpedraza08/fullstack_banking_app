'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Accounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      account_nro: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      bank_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ifsc: {
        type: Sequelize.STRING,
        allowNull: false
      },
      userId: {
				type: Sequelize.INTEGER,
				references: {
					model: 'BankUsers',
					key: 'id',
				},
				onUpdate: 'CASCADE',
				onDelete: 'SET NULL',
			},
      total_balance: {
        type: Sequelize.BIGINT,
        defaultValue: 0
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
    await queryInterface.dropTable('Accounts');
  }
};
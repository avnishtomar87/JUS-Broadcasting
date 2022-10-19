"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("subscriptions", {
      id: {
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
      },
      duration: {
        type: Sequelize.ENUM("7 days", "1 month",),
      },
      amount: {
        type: Sequelize.FLOAT,
      },
      currency: {
        type: Sequelize.ENUM("$", "₹",),
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      payment_key: {
        type: Sequelize.STRING,
      },
      plan_for: {
        type:Sequelize.STRING,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("subscriptions");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_subscriptions_period";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_subscriptions_currency";');
  },
};

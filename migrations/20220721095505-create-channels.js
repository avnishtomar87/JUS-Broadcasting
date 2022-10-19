"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("channels", {
      id: {
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      channel_name: {
        type: Sequelize.STRING,
      },
      logo_url: {
        type: Sequelize.STRING(500),
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
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("channels");
  },
};

"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("media", {
      id: {
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      channel_id: {
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
      },
      media_url: {
        type: Sequelize.STRING(500),
      },
      type: {
        type: Sequelize.ENUM('youtube','livetv','audiobook','radio','music','ads'),
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
    await queryInterface.dropTable("media");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_media_file_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_media_type";');
  },
};

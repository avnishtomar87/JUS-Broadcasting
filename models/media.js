module.exports = (sequelize, DataTypes) => {
  const Media = sequelize.define("media", {
    id: {
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    channel_id: {
      type: DataTypes.INTEGER,
    },
    title: {
      type: DataTypes.STRING,
    },
    media_url: {
      type: DataTypes.STRING(500),
    },
    type: {
      type: DataTypes.ENUM('youtube', 'livetv', 'audiobook', 'radio', 'music', 'ads'),
    },
  },
    {
      freezeTableName: true,
      timestamps: true,
      paranoid: true,
    }
  );
  return Media;
};

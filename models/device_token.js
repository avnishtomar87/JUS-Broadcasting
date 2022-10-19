module.exports = (sequelize, DataTypes) => {
  const Device_Token = sequelize.define( "device_token", {
      id: {
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
      },
      device_token: {
        type: DataTypes.TEXT,
      },
      device_type: {
        type: DataTypes.STRING,
      },
    },
    {
      freezeTableName: true,
      timestamps: true,
      paranoid: true,
    }
  );
  return Device_Token;
};

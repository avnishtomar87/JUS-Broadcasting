module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define("users",{
    id: {
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    first_name: {
      type: DataTypes.STRING,
    },
    last_name: {
      type: DataTypes.STRING,
    },
    user_name: {
      type: DataTypes.STRING,
    },
    dob: {
      type: DataTypes.DATEONLY,
    },
    mobile_number: {
      type: DataTypes.BIGINT,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
    },
    user_type: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user",
    },
    login_type:{
      type: DataTypes.STRING,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: "false",
    },
    geo_location: {
      type:DataTypes.GEOGRAPHY,
    },
    current_address:{
      type:DataTypes.STRING,
    },
    country:{
      type:DataTypes.STRING,
    },
    },
    {
      freezeTableName: true,
      timestamps: true,
      paranoid: true,
    }
  );
  Users.associate = models => {
    Users.hasOne(models.user_subscriptions, {
      foreignKey: { name: "user_id", allowNull: false },
      sourceKey: "id",
      onDelete: "CASCADE",
    });
    models.user_subscriptions.belongsTo(Users, {
      foreignKey: { name: "user_id", allowNull: false },
      targetKey: "id",
    });
  };
  return Users;
};

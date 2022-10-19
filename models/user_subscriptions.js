module.exports = (sequelize, DataTypes) => {
    const User_Subscriptions = sequelize.define("user_subscriptions", {
      id: {
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
      },
      subscription_id: {
        type: DataTypes.INTEGER,
      },
      session_id: {
        type:  DataTypes.STRING,
      },
      subscription_key: {
        type:  DataTypes.STRING,
      },
      payment_status: {
        type:  DataTypes.STRING,
      },
      expires_at: {
        type: DataTypes.DATE,
      },
      is_expired: {
        type: DataTypes.BOOLEAN,
        defaultValue: "false",
      },
    },
        {
            freezeTableName: true,
            timestamps: true,
            paranoid: true,
        }
    );
    
    return User_Subscriptions;
};

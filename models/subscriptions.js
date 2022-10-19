module.exports = (sequelize, DataTypes) => {
  const Subscriptions = sequelize.define("subscriptions", {
    id: {
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    title: {
      type: DataTypes.STRING,
    },
    duration: {
      type: DataTypes.ENUM("7 days", "1 month",),
    },
    amount: {
      type: DataTypes.FLOAT,
    },
    currency: {
      type: DataTypes.ENUM("$", "₹",),
    },
    payment_key: {
      type: DataTypes.STRING,
    },
    plan_for: {
      type: DataTypes.STRING,
    },
  },
    {
      freezeTableName: true,
      timestamps: true,
      paranoid: true,
    }
  );
  Subscriptions.associate = models => {
    Subscriptions.hasMany(models.user_subscriptions, {
      foreignKey: { name: "subscription_id", allowNull: false },
      sourceKey: "id",
      onDelete: "CASCADE",
    });
    models.user_subscriptions.belongsTo(Subscriptions, {
      foreignKey: { name: "subscription_id", allowNull: false },
      targetKey: "id",
    });
  };
  return Subscriptions;
};

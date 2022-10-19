module.exports = (sequelize, DataTypes) => {
    const Channels = sequelize.define("channels", {
        id: {
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            type: DataTypes.INTEGER,
        },
        channel_name: {
            type: DataTypes.STRING,
        },
        logo_url: {
            type: DataTypes.STRING(500),
        }
    },
        {
            freezeTableName: true,
            timestamps: true,
            paranoid: true,
        }
    )
    Channels.associate = models => {
        Channels.hasMany(models.media, {
          foreignKey: { name: "channel_id", allowNull: false },
          sourceKey: "id",
          onDelete: "CASCADE",
        });
        models.media.belongsTo(Channels, {
          foreignKey: { name: "channel_id", allowNull: false },
          targetKey: "id",
        });
      };
    return Channels;
};

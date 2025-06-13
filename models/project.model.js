module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define("project", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    canvasItems: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
  });

  Project.associate = (models) => {
    Project.belongsTo(models.user, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE",
    });
  };

  return Project;
};

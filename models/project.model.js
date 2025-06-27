// models/project.js
module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define("project", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Project.associate = (models) => {
    Project.belongsTo(models.user, {
      foreignKey: "userId",
      as: "user",
      as: "owner", // alias différent de "user"
      onDelete: "CASCADE",
    });

    Project.hasMany(models.page, {
      foreignKey: "projectId",
      as: "pages",
      onDelete: "CASCADE",
    });
  };

  return Project;
};
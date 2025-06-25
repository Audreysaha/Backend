// models/project.js
module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define("project", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // description: {
    //   type: DataTypes.TEXT,
    // },
    // status: {
    //   type: DataTypes.ENUM('active', 'completed', 'pending'),
    //   defaultValue: 'active'
    // },
  });

  Project.associate = (models) => {
    Project.belongsTo(models.user, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return Project;
};
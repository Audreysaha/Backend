module.exports = (sequelize, DataTypes) => {
  const Page = sequelize.define("page", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    canvasWeb: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    canvasMobile: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
  });

  Page.associate = (models) => {
    Page.belongsTo(models.project, {
      foreignKey: "projectId",
      as: "project",
      onDelete: "CASCADE",
    });
  };

  return Page;
};

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
    url: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "URL de déploiement Vercel"
    },
    deploymentId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ID du déploiement Vercel"
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
module.exports = (sequelize, DataTypes) => {
  const Template = sequelize.define("template", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
  });

  return Template;
};

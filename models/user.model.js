const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  User.beforeCreate(async (user) => {
    if (user.password !== "google_oauth") {
      user.password = await bcrypt.hash(user.password, 10);
    }
  });

  User.associate = (models) => {
    User.hasMany(models.project, {
      foreignKey: "userId",
      as: "projects",
    });
  };

  return User;
};

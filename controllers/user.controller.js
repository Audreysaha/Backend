const db = require("../models");
const User = db.user;
const Project = db.project;


exports.getAllUsersWithProjectCount = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email"],
      include: [
        {
          model: Project,
          as: "projects",
          attributes: [],
        },
      ],
      group: ["user.id"],
    });

    const usersWithCount = await Promise.all(
      users.map(async (user) => {
        const count = await Project.count({ where: { userId: user.id } });
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          projectCount: count,
        };
      })
    );

    res.json(usersWithCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Project, as: "projects" }],
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Name, email and password required" });

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const user = await User.create({ name, email, password });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (email && email !== user.email) {
      const exists = await User.findOne({ where: { email } });
      if (exists) return res.status(400).json({ error: "Email already in use" });
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    if (password) user.password = password; // Le hook beforeCreate ne s'exécute pas ici, gérer le hash avant

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    await user.destroy();
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
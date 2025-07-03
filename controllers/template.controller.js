const db = require("../models");

exports.create = async (req, res) => {
  try {
    const { name, content } = req.body;

    if (!name || !content) {
      return res.status(400).json({ error: "Nom et contenu requis" });
    }

    const template = await db.template.create({
      name,
      content
    });

    res.status(201).json({ message: "Template enregistré avec succès", template });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.findAll = async (req, res) => {
  try {
    const templates = await db.template.findAll();

    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.findOne = async (req, res) => {
  try {
    const template = await db.template.findByPk(req.params.id, {
      include: [{ model: db.user, as: "creator", attributes: ["id", "name", "email"] }],
    });

    if (!template) {
      return res.status(404).json({ error: "Template non trouvé" });
    }

    res.json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

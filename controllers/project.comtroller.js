const db = require("../models");

exports.save = async (req, res) => {
  try {
    const { name, userId } = req.body;

    const user = await db.user.findByPk(userId);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const project = await db.project.create({
      name,
      userId,
      canvasItems: [],
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.load = async (req, res) => {
  try {
    const project = await db.project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: "Not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { canvasItems } = req.body;
    const { id } = req.params;

    const project = await db.project.findByPk(id);
    if (!project) return res.status(404).json({ message: "Projet non trouvé" });

    project.canvasItems = canvasItems;
    await project.save();

    res.json({ message: "Projet mis à jour avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loadAllProjectByUser = async (req, res) => {
  try {
    const user = await db.user.findByPk(req.params.id, {
      include: [{ model: db.project, as: "projects" }],
    });

    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    res.json(user.projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    const project = await db.project.findByPk(projectId);
    if (!project) return res.status(404).json({ error: "Projet non trouvé" });

    await project.destroy();

    res.json({ message: "Projet supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.duplicateProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    const original = await db.project.findByPk(projectId);
    if (!original) return res.status(404).json({ error: "Projet original introuvable" });

    const duplicate = await db.project.create({
      name: `${original.name} (copie)`,
      userId: original.userId,
      canvasItems: original.canvasItems,
    });

    res.status(201).json(duplicate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProjectName = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { name } = req.body;

    const project = await db.project.findByPk(projectId);
    if (!project) return res.status(404).json({ error: "Projet introuvable" });

    project.name = name;
    await project.save();

    res.json({ message: "Nom du projet mis à jour", project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
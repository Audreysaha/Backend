const db = require("../models");

exports.save = async (req, res) => {
  try {
    const { name, userId, pages } = req.body;

    const user = await db.user.findByPk(userId);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const project = await db.project.create({ name, userId });

    if (Array.isArray(pages)) {
      for (const page of pages) {
        await db.page.create({
          name: page.name,
          canvasWeb: page.canvasWeb || [],
          canvasMobile: page.canvasMobile || [],
          projectId: project.id,
        });
      }
    }

    const fullProject = await db.project.findByPk(project.id, {
      include: [{ model: db.page, as: "pages" }],
    });

    res.status(201).json(fullProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.load = async (req, res) => {
  try {
    const project = await db.project.findByPk(req.params.id, {
      include: [{ model: db.page, as: "pages" }],
    });

    if (!project) return res.status(404).json({ message: "Projet introuvable" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { pages } = req.body;

    const project = await db.project.findByPk(id, {
      include: [{ model: db.page, as: "pages" }],
    });
    if (!project) return res.status(404).json({ message: "Projet non trouvé" });

    for (const updatedPage of pages) {
      const page = await db.page.findByPk(updatedPage.id);
      if (!page) continue;

      page.name = updatedPage.name || page.name;
      page.canvasWeb = updatedPage.canvasWeb;
      page.canvasMobile = updatedPage.canvasMobile;
      await page.save();
    }

    const refreshed = await db.project.findByPk(id, {
      include: [{ model: db.page, as: "pages" }],
    });

    res.json({ message: "Projet mis à jour avec succès", project: refreshed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loadAllProjectByUser = async (req, res) => {
  try {
    const user = await db.user.findByPk(req.params.id, {
      include: [{
        model: db.project,
        as: "projects",
        include: [{ model: db.page, as: "pages" }],
      }],
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

    const original = await db.project.findByPk(projectId, {
      include: [{ model: db.page, as: "pages" }],
    });

    if (!original) return res.status(404).json({ error: "Projet original introuvable" });

    const duplicate = await db.project.create({
      name: `${original.name} (copie)`,
      userId: original.userId,
    });

    for (const page of original.pages) {
      await db.page.create({
        name: page.name,
        canvasWeb: page.canvasWeb,
        canvasMobile: page.canvasMobile,
        projectId: duplicate.id,
      });
    }

    const full = await db.project.findByPk(duplicate.id, {
      include: [{ model: db.page, as: "pages" }],
    });

    res.status(201).json(full);
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

exports.addPageToProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, canvasWeb = [], canvasMobile = [] } = req.body;

    const project = await db.project.findByPk(projectId);
    if (!project) return res.status(404).json({ error: "Projet non trouvé" });

    const newPage = await db.page.create({
      name,
      canvasWeb,
      canvasMobile,
      projectId: project.id,
    });

    res.status(201).json(newPage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.renamePage = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { name } = req.body;

    const page = await db.page.findByPk(pageId);
    if (!page) return res.status(404).json({ error: "Page non trouvée" });

    page.name = name;
    await page.save();

    res.json({ message: "Page renommée avec succès", page });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


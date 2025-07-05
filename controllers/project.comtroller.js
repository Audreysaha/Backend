const db = require("../models");
const axios = require("axios");
const crypto = require("crypto");
const { page: Page } = require('../models'); // Ajustez le chemin selon votre structure

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
// const PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const TEAM_ID = process.env.VERCEL_TEAM_ID || null;

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

    if (!project)
      return res.status(404).json({ message: "Projet introuvable" });
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
      include: [
        {
          model: db.project,
          as: "projects",
          include: [{ model: db.page, as: "pages" }],
        },
      ],
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

    if (!original)
      return res.status(404).json({ error: "Projet original introuvable" });

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

exports.deletePage = async (req, res) => {
  try {
    const { pageId } = req.params;

    const deletedCount = await db.page.destroy({
      where: { id: pageId },
    });

    if (deletedCount === 0) {
      return res.status(404).json({ error: "Page non trouvée" });
    }

    res.json({ message: "Page supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.deployDesign = async (req, res) => {
  const { html, css, name, pageId } = req.body;
  
  if (!html || !css || !name) {
    return res
      .status(400)
      .json({ success: false, error: "Missing required fields." });
  }

  if (!pageId) {
    return res
      .status(400)
      .json({ success: false, error: "Page ID is required to save deployment info." });
  }

  try {
    // 1. Vérifier que la page existe
    const page = await Page.findByPk(pageId);
    if (!page) {
      return res
        .status(404)
        .json({ success: false, error: "Page not found." });
    }

    // 2. Déploiement sur Vercel
    const deploymentRes = await axios.post(
      "https://api.vercel.com/v6/deployments",
      {
        name,
        files: [
          {
            file: "index.html",
            data: html
          },
          {
            file: "style.css", 
            data: css
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
        params: process.env.VERCEL_TEAM_ID
          ? { teamId: process.env.VERCEL_TEAM_ID }
          : {},
      }
    );

    const deployment = deploymentRes.data;
    const deploymentUrl = `https://${deployment.url}`;

    // 3. Sauvegarder les informations de déploiement dans la base de données
    await page.update({
      url: deploymentUrl,
      deploymentId: deployment.id
    });

    // 4. Retourner la réponse de succès
    res.status(200).json({
      success: true,
      url: deploymentUrl,
      deploymentId: deployment.id,
      message: "Page deployed and saved successfully."
    });

  } catch (err) {
    console.error("Deployment error:", err.response?.data || err.message);
    
    // En cas d'erreur, vérifier si c'est une erreur de déploiement ou de base de données
    if (err.name === 'SequelizeError') {
      return res.status(500).json({ 
        success: false, 
        error: "Database error while saving deployment info: " + err.message 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: err.response?.data?.error?.message || err.message 
    });
  }
};

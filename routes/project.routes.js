const express = require("express");
const { load, save, loadAllProjectByUser, update, removeProject, duplicateProject, updateProjectName, addPageToProject, renamePage, deletePage } = require("../controllers/project.comtroller");
const router = express.Router();

router.post("/save", save);
router.put("/update/:id", update)
router.get("/load/:id", load);
router.get("/:id/projects", loadAllProjectByUser);
router.delete("/remove/:id", removeProject);
router.post("/duplicate/:id", duplicateProject);
router.put("/:id/projects", updateProjectName);
router.post("/:projectId/pages", addPageToProject);
router.put("/pages/:pageId/rename", renamePage);
router.delete("/pages/:pageId/delete", deletePage);

module.exports = router;

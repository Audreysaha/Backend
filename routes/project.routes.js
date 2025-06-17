const express = require("express");
const { load, save, loadAllProjectByUser, update, removeProject, duplicateProject, updateProjectName } = require("../controllers/project.comtroller");
const router = express.Router();

router.post("/save", save);
router.put("/update/:id", update)
router.get("/load/:id", load);
router.get("/:id/projects", loadAllProjectByUser);
router.delete("/remove/:id", removeProject);
router.post("/duplicate/:id", duplicateProject);
router.put("/:id/projects", updateProjectName);

module.exports = router;

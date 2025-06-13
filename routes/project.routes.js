const express = require("express");
const { load, save, loadAllProjectByUser, update } = require("../controllers/project.comtroller");
const router = express.Router();

router.post("/save", save);
router.put("/update/:id", update)
router.get("/load/:id", load);
router.get("/:id/projects", loadAllProjectByUser)

module.exports = router;

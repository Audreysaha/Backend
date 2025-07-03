const express = require("express");
const router = express.Router();
const controller = require("../controllers/template.controller");
// const verifyToken = require("../middleware/verifyToken"); // middleware d'auth

router.post("/save", controller.create);
router.get("/all", controller.findAll);
router.get("/:id", controller.findOne);

module.exports = router;

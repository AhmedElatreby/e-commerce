const express = require("express");
const controller = require("../controllers/user_controllers");
const router = express.Router();

router.get("/", controller.getUsers);

module.exports = router;

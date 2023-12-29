const express = require("express");
const controller = require("../controllers/user_controllers");
const router = express.Router();

router.get("/", controller.getUsers);
router.post("/", controller.addUser);
router.get("/:id", controller.getUserById);
router.put("/:id", controller.updateUser);

module.exports = router;

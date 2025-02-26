const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
// const { auth } = require("../middlewares/authMiddleware");


router.get("/", clientController.getAllUsers);
router.get("/:id", clientController.getUserById);
router.post("/", clientController.createUser);
router.put("/:id", clientController.updateUser);
router.delete("/:id", clientController.deleteUser);

module.exports = router;

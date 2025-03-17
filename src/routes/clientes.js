const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
// const { auth } = require("../middlewares/authMiddleware");

// TODO: a;adir parametros a getAllClientes (ej ?vehicleOwned=Toyota)
router.get("/all", clientController.getAllClients);
router.get("/nombre/:name", clientController.getClientByName);
router.get("/:id", clientController.getClientById);
router.post("/", clientController.createClient);
router.put("/:id", clientController.updateClient);
router.delete("/:id", clientController.deleteClient);

module.exports = router;

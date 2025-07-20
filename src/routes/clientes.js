import { Router } from "express";
import * as clientController from "../controllers/clientController.js";
// const { auth } = require("../middlewares/authMiddleware");

const router = Router();

// TODO: a;adir parametros a getAllClientes (ej ?vehicleOwned=Toyota)
router.get("/all", clientController.getAllClients);
router.get("/nombre/:name", clientController.getClientByName);
router.get("/:id", clientController.getClientById);
router.post("/", clientController.createClient);
router.put("/:id", clientController.updateClient);
router.delete("/:id", clientController.deleteClient);

export default router;

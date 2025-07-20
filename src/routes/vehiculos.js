import { Router } from "express";
import * as vehiculoController from "../controllers/vehiculoController.js";

const router = Router();

router.get("/all", vehiculoController.getVehiculos);
router.get("/:id", vehiculoController.getVehiculoById);
router.get("/cliente/:cliente_id", vehiculoController.getVehiculosByClienteId);
router.get("/matricula/:matricula", vehiculoController.getVehiculoByMatricula);
router.get("/modelo/:cliente_id/:marca", vehiculoController.getModelosByMarca);
router.post("/", vehiculoController.createVehiculo);
router.put("/:id", vehiculoController.updateVehiculo);
router.delete("/:id", vehiculoController.deleteVehiculo);

export default router;

const express = require("express"); // TODO: import only Router
const router = express.Router();
const vehiculoController = require("../controllers/vehiculoController");

router.get("/all", vehiculoController.getVehiculos);
router.get("/:id", vehiculoController.getVehiculoById);
router.get("/cliente/:cliente_id", vehiculoController.getVehiculoByClienteId);
router.get("/matricula/:matricula", vehiculoController.getVehiculoByMatricula);
router.get("/modelo/:cliente_id/:marca", vehiculoController.getModelosByMarca);
router.post("/", vehiculoController.createVehiculo);
router.put("/:id", vehiculoController.updateVehiculo);
router.delete("/:id", vehiculoController.deleteVehiculo);

module.exports = router;

const express = require("express"); // TODO: import only Router
const router = express.Router();
const vehiculoController = require("../controllers/vehiculoController");

router.get("/all", vehiculoController.getVehiculos);
router.get("/:id", vehiculoController.getVehiculoById);
router.post("/", vehiculoController.createVehiculo);
router.put("/:id", vehiculoController.updateVehiculo);
router.delete("/:id", vehiculoController.deleteVehiculo);

module.exports = router;

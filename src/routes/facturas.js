const express = require("express"); // TODO: import only Router
const router = express.Router();
const facturaController = require("../controllers/facturaController");

router.get("/all", facturaController.getFacturas);
router.get("/:id", facturaController.getFacturaById);
router.post("/", facturaController.createFactura);
router.put("/:id", facturaController.updateFactura);
router.delete("/:id", facturaController.deleteFactura);

module.exports = router;

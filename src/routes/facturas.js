import { Router } from "express";
import * as facturaController from "../controllers/facturaController.js";

const router = Router();

router.get("/all", facturaController.getFacturas);
router.get("/:id", facturaController.getFacturaById);
router.post("/", facturaController.createFactura);
router.put("/:id", facturaController.updateFactura);
router.delete("/:id", facturaController.deleteFactura);

export default router;

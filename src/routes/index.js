import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carga todas las rutas definidas en los archivos adentro de routes (menos index.js)
fs.readdirSync(__dirname)
  .filter((file) => file !== "index.js")
  .forEach(async (file) => {
    const routeName = file.replace(".js", "");
    const { default: route } = await import(path.join(__dirname, file));
    router.use(`/${routeName}`, route); // carga la ruta en el router
  });

export default router;

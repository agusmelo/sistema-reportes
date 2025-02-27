const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Carga todas las rutas definidas en los archivos adentro de routes (menos index.js)
fs.readdirSync(__dirname)
  .filter((file) => file !== "index.js")
  .forEach((file) => {
    const routeName = file.replace(".js", "");
    const route = require(path.join(__dirname, file));
    router.use(`/${routeName}`, route); // carga la ruta en el router
  });

module.exports = router;

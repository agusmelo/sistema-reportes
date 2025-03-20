const path = require("path");
const { connectDB } = require(path.join(__dirname, "../db/connect_db.js"));
const handleSQLError = require("../utils/sqliteErrors.js");

async function agregarItem(item) {
  try {
    const db = await connectDB();
    const resultado = await db.query("INSERT INTO items_factura SET ?", [item]);
    return resultado;
  } catch (error) {
    handleSQLError(error, "items_factura");
  }
}

async function obtenerItems() {
  try {
    const db = await connectDB();
    const resultado = await db.query("SELECT * FROM items_factura");
    return resultado;
  } catch (error) {
    handleSQLError(error, "items_factura");
  }
}

async function obtenerItem(id) {
  try {
    const db = await connectDB();
    const resultado = await db.query(
      "SELECT * FROM items_factura WHERE id = ?",
      [id]
    );
    return resultado[0];
  } catch (error) {
    handleSQLError(error, "items_factura");
  }
}

async function actualizarItem(id, cambios) {
  try {
    const db = await connectDB();
    const resultado = await db.query(
      "UPDATE items_factura SET ? WHERE id = ?",
      [cambios, id]
    );
    return resultado;
  } catch (error) {
    handleSQLError(error, "items_factura");
  }
}

async function eliminarItem(id) {
  try {
    const db = await connectDB();
    const resultado = await db.query("DELETE FROM items_factura WHERE id = ?", [
      id,
    ]);
    return resultado;
  } catch (error) {
    handleSQLError(error, "items_factura");
  }
}

module.exports = {
  agregarItem,
  obtenerItem,
  obtenerItems,
  actualizarItem,
  eliminarItem,
};

const path = require("path");
const { connectDB } = require(path.join(__dirname, "../db/connect_db.js"));

async function agregarItem(item) {
  try {
    const resultado = await db.query("INSERT INTO items_factura SET ?", [item]);
    return resultado;
  } catch (error) {
    throw error;
  }
}

async function obtenerItems() {
  try {
    const resultado = await db.query("SELECT * FROM items_factura");
    return resultado;
  } catch (error) {
    throw error;
  }
}

async function obtenerItem(id) {
  try {
    const resultado = await db.query(
      "SELECT * FROM items_factura WHERE id = ?",
      [id],
    );
    return resultado[0];
  } catch (error) {
    throw error;
  }
}

async function actualizarItem(id, cambios) {
  try {
    const resultado = await db.query(
      "UPDATE items_factura SET ? WHERE id = ?",
      [cambios, id],
    );
    return resultado;
  } catch (error) {
    throw error;
  }
}

async function eliminarItem(id) {
  try {
    const resultado = await db.query("DELETE FROM items_factura WHERE id = ?", [
      id,
    ]);
    return resultado;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  agregarItem,
  obtenerItem,
  obtenerItems,
  actualizarItem,
  eliminarItem,
};

const path = require("path");
const { connectDB } = require(path.join(__dirname, "../db/connect_db.js"));

async function agregarFactura(factura) {
  try {
    const resultado = await db.query("INSERT INTO facturas SET ?", [factura]);
    return resultado;
  } catch (error) {
    throw error;
  }
}

async function obtenerFacturas() {
  try {
    const resultado = await db.query("SELECT * FROM facturas");
    return resultado;
  } catch (error) {
    throw error;
  }
}

async function obtenerFactura(id) {
  try {
    const resultado = await db.query("SELECT * FROM facturas WHERE id = ?", [
      id,
    ]);
    return resultado[0];
  } catch (error) {
    throw error;
  }
}

async function actualizarFactura(id, cambios) {
  try {
    const resultado = await db.query("UPDATE facturas SET ? WHERE id = ?", [
      cambios,
      id,
    ]);
    return resultado;
  } catch (error) {
    throw error;
  }
}

async function eliminarFactura(id) {
  try {
    const resultado = await db.query("DELETE FROM facturas WHERE id = ?", [id]);
    return resultado;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  agregarFactura,
  obtenerFactura,
  obtenerFacturas,
  actualizarFactura,
  eliminarFactura,
};

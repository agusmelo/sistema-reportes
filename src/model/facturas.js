const path = require("path");
const { connectDB } = require("../db/connect_db.js");

async function agregarFactura(
  cliente_id,
  fecha,
  marca,
  modelo,
  matricula,
  kilometraje,
  items,
  tieneIva,
  subtotal,
  total
) {
  /*
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      fecha DATE NOT NULL,
      marca TEXT NOT NULL,
      modelo TEXT NOT NULL,
      matricula TEXT NOT NULL,
      kilometraje INTEGER NOT NULL,
      iva BOOLEAN NOT NULL,
      subtotal REAL NOT NULL,
      total REAL NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
  */
  try {
    const db = connectDB();
    const factura = {
      cliente_id,
      fecha,
      marca,
      modelo,
      matricula,
      kilometraje,
      items,
      iva: tieneIva,
      subtotal,
      total,
    };
    const resultado = await db.run(
      "INSERT INTO facturas(cliente_id, fecha, marca, modelo, matricula, kilometraje, iva, subtotal, total) VALUES ?",
      [factura]
    );
    return resultado;
  } catch (error) {
    throw error;
  }
}

async function obtenerFacturas() {
  try {
    const db = connectDB();
    const resultado = await db.all("SELECT * FROM facturas");
    return resultado;
  } catch (error) {
    throw error;
  }
}

async function obtenerFactura(id) {
  try {
    const db = connectDB();
    const resultado = await db.all("SELECT * FROM facturas WHERE id = ?", [id]);
    return resultado[0];
  } catch (error) {
    throw error;
  }
}

async function actualizarFactura(id, cambios) {
  try {
    const db = connectDB();
    const resultado = await db.run("UPDATE facturas SET ? WHERE id = ?", [
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
    const db = connectDB();
    const resultado = await db.run("DELETE FROM facturas WHERE id = ?", [id]);
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

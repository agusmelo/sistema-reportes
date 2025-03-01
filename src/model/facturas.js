const path = require("path");
const { connectDB } = require("../db/connect_db.js");

async function agregarFactura(
  cliente_id,
  vehiculo_id,
  fecha,
  tieneIva,
  subtotal,
  total
) {
  let db;
  try {
    db = connectDB();
    
  } catch (error) {
    throw error;
  }
  
  try {
    const insertFactura = db.prepare(
      "INSERT INTO facturas(cliente_id, vehiculo_id, fecha, iva, subtotal, total) VALUES ( ?, ?, ?, ?, ?, ?)"
    );

    const insertItem = db.prepare(
      "INSERT INTO items_factura(factura_id, cantidad, descripcion, precio_unitario) VALUES (?, ?, ?, ?)"
    );

    db.run("BEGIN TRANSACTION");
    insertFactura.run(
      cliente_id,
      vehiculo_id,
      fecha,
      tieneIva,
      subtotal,
      total
    );
    const facturaId = db.
    return resultado;
  } catch (error) {
    rollback
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

async function agregarItemFactura(
  factura_id,
  cantidad,
  descripcion,
  precio_unitario
) {
  try {
    const db = connectDB();
    const resultado = await db.run(
      "INSERT INTO items_factura(factura_id, cantidad, descripcion, precio_unitario) VALUES ?",
      [factura_id, cantidad, descripcion, precio_unitario]
    );
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

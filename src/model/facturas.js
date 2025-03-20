const path = require("path");
const { connectDB } = require("../db/connect_db.js");
const handleSQLError = require("../utils/sqliteErrors.js");

async function agregarFactura(
  cliente_id,
  vehiculo_id,
  fecha,
  items,
  tieneIva,
  subtotal,
  total
) {
  const resultado = await insertarFacturaTransaction(
    cliente_id,
    vehiculo_id,
    fecha,
    tieneIva,
    subtotal,
    total,
    items
  );
  return resultado;
}

async function obtenerFacturas() {
  try {
    const db = await connectDB();
    const resultado = await db.all("SELECT * FROM facturas");
    //append items
    for (const [index, value] of resultado.entries()) {
      const items = await db.all(
        "SELECT * FROM items_factura WHERE factura_id = ?",
        [value.id]
      );
      resultado[index].items = items;
    }

    //TODO: revisar el fromato como llegan las fechas y como guardarlas
    // resultado.forEach((factura) => {
    //   factura.fecha = new Date(factura.fecha);
    // });
    return resultado;
  } catch (error) {
    handleSQLError(error, "facturas");
  }
}

async function obtenerFactura(id) {
  try {
    const db = await connectDB();
    const resultado = await db.all("SELECT * FROM facturas WHERE id = ?", [id]);
    const items = await db.all(
      "SELECT * FROM items_factura WHERE factura_id = ?",
      [id]
    );
    resultado[0].items = items;
    return resultado[0];
  } catch (error) {
    handleSQLError(error, "facturas");
  }
}

async function actualizarFactura(id, cambios) {
  try {
    const db = await connectDB();
    const resultado = await db.run("UPDATE facturas SET ? WHERE id = ?", [
      cambios,
      id,
    ]);
    return resultado;
  } catch (error) {
    handleSQLError(error, "facturas");
  }
}

async function eliminarFactura(id) {
  try {
    const db = await connectDB();
    const resultado = await db.run("DELETE FROM facturas WHERE id = ?", [id]);
    return resultado;
  } catch (error) {
    handleSQLError(error, "facturas");
  }
}

async function agregarItemFactura(
  factura_id,
  cantidad,
  descripcion,
  precio_unitario
) {
  try {
    const db = await connectDB();
    const resultado = await db.run(
      "INSERT INTO items_factura(factura_id, cantidad, descripcion, precio_unitario) VALUES ?",
      [factura_id, cantidad, descripcion, precio_unitario]
    );
  } catch (error) {
    handleSQLError(error, "facturas");
  }
}

// TODO: a;adir un mutex?
async function insertarFacturaTransaction(
  cliente_id,
  vehiculo_id,
  fecha,
  tieneIva,
  subtotal,
  total,
  items
) {
  const db = await connectDB();
  db.getDatabaseInstance().serialize();
  db.run("BEGIN");
  try {
    const insertFactura = db.prepare(
      "INSERT INTO facturas(cliente_id, vehiculo_id, fecha, iva, subtotal, total) VALUES ( ?, ?, ?, ?, ?, ?)"
    );
    const insertItem = db.prepare(
      "INSERT INTO items_factura(factura_id, cantidad, descripcion, precio_unitario) VALUES (?, ?, ?, ?)"
    );

    const { lastInsertRowid: facturaId } = await insertFactura.run(
      cliente_id,
      vehiculo_id,
      fecha,
      tieneIva,
      subtotal,
      total
    );

    for (const item of items) {
      insertItem.run(facturaId, item.cantidad, item.descripcion, item.precio);
    }
    db.commit();
    db.getDatabaseInstance().parallelize();
    return lastInsertRowid;
  } catch (error) {
    db.run("ROLLBACK");
    db.getDatabaseInstance().parallelize();
    handleSQLError(error, "facturas");
  }
}

module.exports = {
  agregarFactura,
  obtenerFactura,
  obtenerFacturas,
  actualizarFactura,
  eliminarFactura,
};

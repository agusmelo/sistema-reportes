const path = require("path");
const { connectDB } = require("../db/connect_db.js");
const handleSQLError = require("../utils/sqliteErrors.js");

//TODO: Hay alguna mejor manera de hacer esto? (el pasaje esta solo para abstraer la transaccion)
// Me refiero a poder chainear varias funciones en una transaccion y luego ejecutarla
/*
  Algo como:
  function (functions[]){
    db.run("BEGIN");
    try{
      for (const func of functions) {
        func();
      }
    } catch(error) {
      db.run("ROLLBACK");
      handleSQLError(error);
    }
    db.commit();
  }
   Tendria que catchear los errores que tiren las funciones en esa funcion para poder hacer el rollback
*/
async function agregarFactura(cliente_id, vehiculo_id, fecha, items, tieneIva) {
  const resultado = await insertarFacturaTransaction(
    cliente_id,
    vehiculo_id,
    fecha,
    tieneIva,
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
  items
) {
  const db = await connectDB();
  db.getDatabaseInstance().serialize();
  db.run("BEGIN");
  try {
    const res = await db.run(
      "INSERT INTO facturas (cliente_id, vehiculo_id, fecha, incluye_iva) VALUES (?, ?, ?, ?)",
      cliente_id,
      vehiculo_id,
      fecha,
      tieneIva
    );
    if (res.changes === 0) {
      throw new Error("No se pudo insertar la factura");
    }

    const insertItemQuery =
      "INSERT INTO items_factura(factura_id, cantidad, descripcion, precio_unitario) VALUES (?, ?, ?, ?)";
    for (const item of items) {
      await db.run(
        insertItemQuery,
        res.lastID,
        item.quantity,
        item.description,
        item.unitPrice
      );
    }
    db.run("COMMIT");
    db.getDatabaseInstance().parallelize();
    return res.lastID;
  } catch (error) {
    db.run("ROLLBACK");
    db.getDatabaseInstance().parallelize();
    handleSQLError(error, "facturas");
  }
}

async function getInvoiceWithTotal(facturaId) {
  try {
    const db = await connectDB();
    const result = await db.get(
      `SELECT 
                f.id,
                f.cliente_id,
                f.vehiculo_id,
                f.fecha,
                f.incluye_iva,
                COALESCE(SUM(i.cantidad * i.precio_unitario), 0) AS subtotal,
                CASE 
                    WHEN f.incluye_iva = 1 THEN COALESCE(SUM(i.cantidad * i.precio_unitario), 0) * 0.21
                    ELSE 0
                END AS iva,
                CASE 
                    WHEN f.incluye_iva = 1 THEN COALESCE(SUM(i.cantidad * i.precio_unitario), 0) * 1.21
                    ELSE COALESCE(SUM(i.cantidad * i.precio_unitario), 0)
                END AS total
            FROM facturas f
            LEFT JOIN items_factura i ON i.factura_id = f.id
            WHERE f.id = ?
            GROUP BY f.id`,
      [facturaId]
    );
    return result;
  } catch (error) {
    handleSQLError(error, "facturas");
  }
}

module.exports = {
  agregarFactura,
  obtenerFactura,
  obtenerFacturas,
  actualizarFactura,
  eliminarFactura,
  getInvoiceWithTotal,
};

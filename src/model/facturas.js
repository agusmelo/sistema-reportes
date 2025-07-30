import path from "path";
import { connectDB } from "../db/connect_db.js";
import handleSQLError from "../utils/sqliteErrors.js";
import { buildUpdateQuery } from "../utils/helpers.js";

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
    const resultado = await db.all(
      "SELECT f.*, c.nombre cliente_nombre, v.marca, v.modelo, v.matricula, v.kilometraje FROM facturas f JOIN clientes c ON f.cliente_id = c.id JOIN vehiculos v ON f.vehiculo_id = v.id ORDER BY f.fecha DESC"
    );
    //append items
    for (const [index, value] of resultado.entries()) {
      const items = await db.all(
        "SELECT * FROM items_factura WHERE factura_id = ?",
        [value.id]
      );
      resultado[index].items = items;
    }
    console.log("obtenerFacturas", resultado[0]);
    return resultado;
  } catch (error) {
    handleSQLError(error, "facturas");
  }
}

async function obtenerFacturasPaginadas(
  page = 1,
  limit = 10,
  sortBy = "fecha",
  sortOrder = "DESC",
  filters = {}
) {
  try {
    const db = await connectDB();
    const offset = (page - 1) * limit;

    // Build WHERE clause for filters
    let whereClause = "";
    let whereParams = [];

    if (filters && Object.keys(filters).length > 0) {
      const conditions = [];

      if (filters.cliente_nombre) {
        conditions.push("c.nombre LIKE ?");
        whereParams.push(`%${filters.cliente_nombre}%`);
      }

      if (filters.marca) {
        conditions.push("v.marca LIKE ?");
        whereParams.push(`%${filters.marca}%`);
      }

      if (filters.modelo) {
        conditions.push("v.modelo LIKE ?");
        whereParams.push(`%${filters.modelo}%`);
      }

      if (filters.matricula) {
        conditions.push("v.matricula LIKE ?");
        whereParams.push(`%${filters.matricula}%`);
      }

      if (filters.incluye_iva !== undefined) {
        conditions.push("f.incluye_iva = ?");
        whereParams.push(filters.incluye_iva ? 1 : 0);
      }

      if (filters.fecha_desde) {
        conditions.push("f.fecha >= ?");
        whereParams.push(filters.fecha_desde);
      }

      if (filters.fecha_hasta) {
        conditions.push("f.fecha <= ?");
        whereParams.push(filters.fecha_hasta);
      }

      if (conditions.length > 0) {
        whereClause = "WHERE " + conditions.join(" AND ");
      }
    }

    // Validate sortBy to prevent SQL injection
    const allowedSortColumns = [
      "fecha",
      "cliente_nombre",
      "marca",
      "modelo",
      "matricula",
      "incluye_iva",
      "id",
    ];
    const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : "fecha";
    const validSortOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    // Map frontend column names to database column names
    const columnMapping = {
      cliente_nombre: "c.nombre",
      marca: "v.marca",
      modelo: "v.modelo",
      matricula: "v.matricula",
      fecha: "f.fecha",
      incluye_iva: "f.incluye_iva",
      id: "f.id",
    };

    const dbSortColumn = columnMapping[validSortBy] || "f.fecha";

    // Get total count for pagination info (with filters)
    const countQuery = `SELECT COUNT(*) as total 
                       FROM facturas f 
                       JOIN clientes c ON f.cliente_id = c.id 
                       JOIN vehiculos v ON f.vehiculo_id = v.id 
                       ${whereClause}`;
    const countResult = await db.get(countQuery, whereParams);
    const total = countResult.total;

    // Get paginated results (with filters and sorting)
    const query = `SELECT f.*, c.nombre cliente_nombre, v.marca, v.modelo, v.matricula, v.kilometraje 
                   FROM facturas f 
                   JOIN clientes c ON f.cliente_id = c.id 
                   JOIN vehiculos v ON f.vehiculo_id = v.id 
                   ${whereClause}
                   ORDER BY ${dbSortColumn} ${validSortOrder} 
                   LIMIT ? OFFSET ?`;

    const resultado = await db.all(query, [...whereParams, limit, offset]);

    // Append items for each invoice
    for (const [index, value] of resultado.entries()) {
      const items = await db.all(
        "SELECT * FROM items_factura WHERE factura_id = ?",
        [value.id]
      );
      resultado[index].items = items;
    }

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data: resultado,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
    };
  } catch (error) {
    handleSQLError(error, "facturas");
  }
}

async function obtenerFactura(id) {
  try {
    const db = await connectDB();
    const resultado = await db.get(
      "SELECT f.*, c.nombre, v.marca, v.modelo, v.matricula, v.kilometraje FROM facturas f JOIN clientes c ON f.cliente_id = c.id JOIN vehiculos v ON f.vehiculo_id = v.id WHERE id = ?",
      [id]
    );
    if (resultado) {
      const items = await db.all(
        "SELECT * FROM items_factura WHERE factura_id = ?",
        [id]
      );
      resultado.items = items;
    }
    return resultado;
  } catch (error) {
    handleSQLError(error, "facturas");
  }
}

async function actualizarFactura(id, cambios) {
  try {
    const db = await connectDB();
    const { query, values } = buildUpdateQuery("facturas", cambios, id);
    const resultado = await db.run(query, values);
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

export default {
  agregarFactura,
  obtenerFactura,
  obtenerFacturas,
  obtenerFacturasPaginadas,
  actualizarFactura,
  eliminarFactura,
  getInvoiceWithTotal,
};

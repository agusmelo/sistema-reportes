import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { connectDB } from "../db/connect_db.js";
import handleSQLError from "../utils/sqliteErrors.js";
import { buildUpdateQuery } from "../utils/helpers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function agregarItem(item) {
  try {
    const db = await connectDB();
    // Build dynamic INSERT query for SQLite
    const keys = Object.keys(item);
    const columns = keys.join(", ");
    const placeholders = keys.map(() => "?").join(", ");
    const values = keys.map((key) => item[key]);

    const resultado = await db.run(
      `INSERT INTO items_factura (${columns}) VALUES (${placeholders})`,
      values
    );
    return resultado;
  } catch (error) {
    handleSQLError(error, "items_factura");
  }
}

async function obtenerItems() {
  try {
    const db = await connectDB();
    const resultado = await db.all("SELECT * FROM items_factura");
    return resultado;
  } catch (error) {
    handleSQLError(error, "items_factura");
  }
}

async function obtenerItem(id) {
  try {
    const db = await connectDB();
    const resultado = await db.get("SELECT * FROM items_factura WHERE id = ?", [
      id,
    ]);
    return resultado;
  } catch (error) {
    handleSQLError(error, "items_factura");
  }
}

async function actualizarItem(id, cambios) {
  try {
    const db = await connectDB();
    const { query, values } = buildUpdateQuery("items_factura", cambios, id);
    const resultado = await db.run(query, values);
    return resultado;
  } catch (error) {
    handleSQLError(error, "items_factura");
  }
}

async function eliminarItem(id) {
  try {
    const db = await connectDB();
    const resultado = await db.run("DELETE FROM items_factura WHERE id = ?", [
      id,
    ]);
    return resultado;
  } catch (error) {
    handleSQLError(error, "items_factura");
  }
}

export { agregarItem, obtenerItem, obtenerItems, actualizarItem, eliminarItem };

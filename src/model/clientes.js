import path from "path";
import handleSQLError from "../utils/sqliteErrors.js";
import { connectDB } from "../db/connect_db.js";
import { buildUpdateQuery } from "../utils/helpers.js";
async function agregarCliente(nombreCliente) {
  try {
    const db = await connectDB();
    const resultado = await db.run("INSERT INTO clientes(nombre) VALUES (?)", [
      nombreCliente,
    ]);
    console.log("Cliente agregado:", resultado);
    return { lastID: resultado.lastID };
  } catch (error) {
    handleSQLError(error, "clientes");
  }
}

async function obtenerClientes() {
  try {
    const db = await connectDB();
    const resultado = await db.all("SELECT * FROM clientes");
    return resultado;
  } catch (error) {
    handleSQLError(error, "clientes");
  }
}

async function obtenerCliente(id) {
  try {
    const db = await connectDB();
    const resultado = await db.get("SELECT * FROM clientes WHERE id = ?", [id]);
    return resultado;
  } catch (error) {
    handleSQLError(error, "clientes");
  }
}

async function obtenerClientePorNombre(nombre) {
  try {
    const db = await connectDB();
    const resultado = await db.all("SELECT * FROM clientes WHERE nombre = ?", [
      nombre,
    ]);
    return resultado;
  } catch (error) {
    handleSQLError(error, "clientes");
  }
}

//TODO: rehacer
async function actualizarCliente(id, data) {
  try {
    const db = await connectDB();
    const { query, values } = buildUpdateQuery("clientes", data, id);
    const resultado = await db.run(query, values);
    return resultado;
  } catch (error) {
    handleSQLError(error, "clientes");
  }
}

async function eliminarCliente(id) {
  try {
    const db = await connectDB();
    const resultado = await db.get("SELECT * FROM clientes WHERE id = ?", [id]);
    if (!resultado) {
      return { id, succesful: 0 };
    }
    const { changes } = await db.run("DELETE FROM clientes WHERE id = ?", [id]);
    return { id: resultado.id, succesful: changes };
  } catch (error) {
    handleSQLError(error, "clientes");
  }
}

export default {
  agregarCliente,
  obtenerCliente,
  obtenerClientes,
  obtenerClientePorNombre,
  actualizarCliente,
  eliminarCliente,
};

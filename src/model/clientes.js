const path = require("path");
const handleSQLError = require("../utils/sqliteErrors.js");
const { connectDB } = require("../db/connect_db.js");
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
    const resultado = await db.all("SELECT * FROM clientes WHERE id = ?", [id]);
    console.log(resultado);
    return resultado[0];
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
    const resultado = await db.run("UPDATE clientes SET ? WHERE id = ?", [
      cambios,
      id,
    ]);
    return resultado;
  } catch (error) {
    handleSQLError(error, "clientes");
  }
}

async function eliminarCliente(id) {
  try {
    const db = await connectDB();
    const resultado = await db.all("SELECT * FROM clientes WHERE id = ?", [id]);
    if (resultado.length === 0) {
      return { id, succesful: 0 };
    }
    const { changes } = await db.run("DELETE FROM clientes WHERE id = ?", [id]);
    return { id: resultado[0].id, succesful: changes };
  } catch (error) {
    handleSQLError(error, "clientes");
  }
}

module.exports = {
  agregarCliente,
  obtenerCliente,
  obtenerClientes,
  obtenerClientePorNombre,
  actualizarCliente,
  eliminarCliente,
};

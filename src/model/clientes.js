const path = require("path");
const { connectDB } = require(path.join(__dirname, "../db/connect_db.js"));

async function agregarCliente(nombreCliente) {
  try {
    const db = await connectDB();
    const resultado = await db.run("INSERT INTO clientes(nombre) VALUES (?)", [
      nombreCliente,
    ]);
    return resultado;
  } catch (error) {
    throw error;
  }
}

async function obtenerClientes() {
  try {
    const db = await connectDB();
    const resultado = await db.all("SELECT * FROM clientes");
    return resultado;
  } catch (error) {
    throw error;
  }
}

async function obtenerCliente(id) {
  try {
    const db = await connectDB();
    const resultado = await db.all("SELECT * FROM clientes WHERE id = ?", [id]);
    console.log(resultado);
    return resultado;
  } catch (error) {
    throw error;
  }
}

async function actualizarCliente(id, data) {
  try {
    const db = await connectDB();
    const resultado = await db.run("UPDATE clientes SET ? WHERE id = ?", [
      cambios,
      id,
    ]);
    return resultado;
  } catch (error) {
    throw error;
  }
}

async function eliminarCliente(id) {
  try {
    const db = await connectDB();
    const resultado = await db.run("DELETE FROM clientes WHERE id = ?", [id]);
    return resultado;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  agregarCliente,
  obtenerCliente,
  obtenerClientes,
  actualizarCliente,
  eliminarCliente,
};

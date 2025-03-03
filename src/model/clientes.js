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
    if (error.code === "SQLITE_CONSTRAINT") {
      if (error.message.includes("UNIQUE constraint failed: clientes.nombre")) {
        throw new Error("El nombre del cliente ya está registrado");
      }
    }

    console.error("Database Error:", error.message);
    throw new Error("Ocurrió un error al insertar el cliente");
  }
}

async function obtenerClientes() {
  try {
    const db = await connectDB();
    const resultado = await db.all("SELECT * FROM clientes");
    return resultado;
  } catch (error) {
    console.error("Database Error:", error.message);
    throw new Error("Ocurrió un error al obtener el cliente");
  }
}

async function obtenerCliente(id) {
  try {
    const db = await connectDB();
    const resultado = await db.all("SELECT * FROM clientes WHERE id = ?", [id]);
    console.log(resultado);
    return resultado[0];
  } catch (error) {
    console.error("Database Error:", error.message);
    throw new Error("Ocurrió un error al obtener el cliente");
  }
}

async function obtenerClientePorNombre(nombre) {
  try {
    const db = await connectDB();
    const resultado = await db.all("SELECT * FROM clientes WHERE nombre = ?", [
      nombre,
    ]);
    return resultado[0];
  } catch (error) {
    console.error("Database Error:", error.message);
    throw new Error("Ocurrió un error al obtener el cliente");
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
    console.error("Database Error:", error.message);
    throw new Error("Ocurrió un error al actualizar el cliente");
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
    console.error("Database Error:", error.message);
    throw new Error("Ocurrió un error al eliminar el cliente");
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

import path from "path";
import { connectDB } from "../db/connect_db.js";
import handleSQLError from "../utils/sqliteErrors.js";
import { buildUpdateQuery } from "../utils/helpers.js";
async function agregarVehiculo(
  cliente_id,
  marca,
  modelo,
  matricula,
  kilometraje
) {
  try {
    const db = await connectDB();
    const resultado = await db.run(
      "INSERT INTO vehiculos(cliente_id, marca, modelo, matricula, kilometraje) VALUES (?, ?, ?, ?, ?)",
      [cliente_id, marca, modelo, matricula, kilometraje]
    );
    console.log("agregarVehiculo", resultado);
    return { lastID: resultado.lastID };
  } catch (error) {
    handleSQLError(error, "vehiculos");
  }
}

async function obtenerVehiculos() {
  try {
    const db = await connectDB();
    const resultado = await db.all("SELECT * FROM vehiculos");
    return resultado;
  } catch (error) {
    handleSQLError(error, "vehiculos");
  }
}
async function obtenerVehiculo(id) {
  try {
    const db = await connectDB();
    const resultado = await db.get("SELECT * FROM vehiculos WHERE id = ?", [
      id,
    ]);
    console.log(resultado);
    return resultado;
  } catch (error) {
    handleSQLError(error, "vehiculos");
  }
}

async function obtenerVehiculoPorMatricula(matricula) {
  try {
    const db = await connectDB();
    const resultado = await db.get(
      "SELECT vehiculos.*, clientes.nombre AS cliente_nombre FROM vehiculos JOIN clientes ON vehiculos.cliente_id = clientes.id WHERE vehiculos.matricula = ?",
      [matricula]
    );
    return resultado;
  } catch (error) {
    handleSQLError(error, "vehiculos");
  }
}

async function obtenerVehiculosClientePorMarcaYModelo(
  cliente_id,
  marca,
  modelo
) {
  try {
    const db = await connectDB();
    const resultado = await db.all(
      "SELECT * FROM vehiculos WHERE cliente_id = ? AND marca = ? AND modelo = ?",
      [cliente_id, marca, modelo]
    );
    return resultado;
  } catch (error) {
    handleSQLError(error, "vehiculos");
  }
}

async function getModelosDeMarca(cliente_id, marca) {
  try {
    const db = await connectDB();
    const resultado = await db.all(
      "SELECT modelo FROM vehiculos WHERE cliente_id = ? AND marca = ?",
      [cliente_id, marca]
    );
    return resultado;
  } catch (error) {
    handleSQLError(error, "vehiculos");
  }
}

async function obtenerVehiculoCliente(cliente_id) {
  try {
    const db = await connectDB();
    const resultado = await db.all(
      "SELECT * FROM vehiculos WHERE cliente_id = ?",
      [cliente_id]
    );
    return resultado;
  } catch (error) {
    handleSQLError(error, "vehiculos");
  }
}

async function actualizarVehiculo(id, cambios) {
  try {
    const db = await connectDB();
    const { query, values } = buildUpdateQuery("vehiculos", cambios, id);
    const resultado = await db.run(query, values);
    return resultado;
  } catch (error) {
    handleSQLError(error, "vehiculos");
  }
}
async function eliminarVehiculo(id) {
  try {
    const db = await connectDB();
    const resultado = await db.get("SELECT * FROM vehiculos WHERE id = ?", [
      id,
    ]);
    if (!resultado) {
      return { id, succesful: 0 };
    }
    const { changes } = await db.run("DELETE FROM vehiculos WHERE id = ?", [
      id,
    ]);
    return { id: resultado.id, succesful: changes };
  } catch (error) {
    handleSQLError(error, "vehiculos");
  }
}

async function actualizarKilometraje(matricula, kilometraje) {
  try {
    const db = await connectDB();
    const resultado = await db.run(
      "UPDATE vehiculos SET kilometraje = ? WHERE matricula = ?",
      [kilometraje, matricula]
    );
    console.log("actualizarKilometraje", resultado);
    return resultado;
  } catch (error) {
    handleSQLError(error, "vehiculos");
  }
}

export default {
  agregarVehiculo,
  obtenerVehiculos,
  obtenerVehiculo,
  obtenerVehiculoPorMatricula,
  obtenerVehiculosClientePorMarcaYModelo,
  getModelosDeMarca,
  actualizarVehiculo,
  eliminarVehiculo,
  obtenerVehiculoCliente,
  actualizarKilometraje,
};

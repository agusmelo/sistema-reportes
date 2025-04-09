const path = require("path");
const { connectDB } = require(path.join(__dirname, "../db/connect_db.js"));
const handleSQLError = require("../utils/sqliteErrors.js");
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
    return { succesful: resultado.changes };
  } catch (error) {
    handleSQLError(error, "vehiculos");
  }
}

async function obtenerVehiculos() {
  const db = await connectDB();
  const resultado = await db.all("SELECT * FROM vehiculos");
  return resultado;
}
async function obtenerVehiculo(id) {
  const db = await connectDB();
  const resultado = await db.all("SELECT * FROM vehiculos WHERE id = ?", [id]);
  console.log(resultado);
  return resultado[0];
}

async function obtenerVehiculoPorMatricula(matricula) {
  const db = await connectDB();
  const resultado = await db.all(
    "SELECT vehiculos.*, clientes.nombre AS cliente_nombre FROM vehiculos JOIN clientes ON vehiculos.cliente_id = clientes.id WHERE vehiculos.matricula = ?",
    [matricula]
  );
  return resultado[0];
}

async function obtenerVehiculosClientePorMarcaYModelo(
  cliente_id,
  marca,
  modelo
) {
  const db = await connectDB();
  const resultado = await db.all(
    "SELECT * FROM vehiculos WHERE cliente_id = ? AND marca = ? AND modelo = ?",
    [cliente_id, marca, modelo]
  );
  return resultado;
}

async function getModelosDeMarca(cliente_id, marca) {
  const db = await connectDB();
  const resultado = await db.all(
    "SELECT modelo FROM vehiculos WHERE cliente_id = ? AND marca = ?",
    [cliente_id, marca]
  );
  return resultado;
}

async function obtenerVehiculoCliente(cliente_id) {
  const db = await connectDB();
  const resultado = await db.all(
    "SELECT * FROM vehiculos WHERE cliente_id = ?",
    [cliente_id]
  );
  return resultado;
}

async function actualizarVehiculo(id, cambios) {
  //   const db = await connectDB();
  //   const resultado = await db.run("UPDATE vehiculos VALUES ? WHERE id = ?", [
  //     cambios,
  //     id,
  //   ]);
  //   return resultado;
}
async function eliminarVehiculo(id) {
  const db = await connectDB();
  const resultado = await db.all("SELECT * FROM vehiculos WHERE id = ?", [id]);
  if (resultado.length === 0) {
    return { id, succesful: 0 };
  }
  const { changes } = await db.run("DELETE FROM vehiculos WHERE id = ?", [id]);
  return { id: resultado[0].id, succesful: changes };
}

async function actualizarKilometraje(matricula, kilometraje) {
  const db = await connectDB();
  const resultado = await db.run(
    "UPDATE vehiculos SET kilometraje = ? WHERE matricula = ?",
    [kilometraje, matricula]
  );
  console.log("actualizarKilometraje", resultado);
  return resultado;
}

module.exports = {
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

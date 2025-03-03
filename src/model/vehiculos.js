const path = require("path");
const { connectDB } = require(path.join(__dirname, "../db/connect_db.js"));

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
    if (error.code === "SQLITE_CONSTRAINT") {
      if (
        error.message.includes("UNIQUE constraint failed: vehiculos.matricula")
      ) {
        throw new Error("Un vehiculo con esa matrícula ya está registrado");
        //TODO: Mostrar la info del vehiculo que ya existe
      }
    }
    console.error("Database Error:", error.message);
    throw new Error("Ocurrió un error al insertar el cliente");
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
module.exports = {
  agregarVehiculo,
  obtenerVehiculos,
  obtenerVehiculo,
  actualizarVehiculo,
  eliminarVehiculo,
};

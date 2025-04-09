const VehiculoModel = require("../model/vehiculos");
const responseHandler = require("../utils/responseHandler");
const Logger = require("../utils/customLog");
// Obtener todos los vehículos
exports.getVehiculos = async (req, res) => {
  try {
    const vehiculos = await VehiculoModel.obtenerVehiculos();
    res.status(200).json(vehiculos);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los vehículos",
      error: error.message,
    });
  }
};

// Obtener un vehículo por ID
exports.getVehiculoById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehiculo = await VehiculoModel.obtenerVehiculo(id);
    if (!vehiculo) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }
    res.status(200).json(vehiculo);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el vehículo",
      error: error.message,
    });
  }
};

exports.getVehiculosByClienteId = async (req, res) => {
  try {
    const { cliente_id } = req.params;
    // check query params for marca and modelo
    const { marca, modelo } = req.query;
    if (marca && modelo) {
      const vehiculo =
        await VehiculoModel.obtenerVehiculosClientePorMarcaYModelo(
          cliente_id,
          marca,
          modelo
        );
      if (!vehiculo) {
        return res.status(404).json({ message: "Vehículo no encontrado" });
      }
      return res.status(200).json(vehiculo);
    }
    const vehiculo = await VehiculoModel.obtenerVehiculoCliente(cliente_id);
    if (!vehiculo) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }
    res.status(200).json(vehiculo);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el vehículo",
      error: error.message,
    });
  }
};

// Crear un nuevo vehículo
exports.createVehiculo = async (req, res) => {
  const { cliente_id, marca, modelo, matricula, kilometraje } = req.body;
  try {
    await VehiculoModel.agregarVehiculo(
      cliente_id,
      marca,
      modelo,
      matricula,
      kilometraje
    );
    res.status(201).json({
      message: "Vehículo creado",
      vehiculo: {
        cliente_id,
        marca,
        modelo,
        matricula,
        kilometraje,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: "Error al crear el vehículo",
      error: error.message,
    });
  }
};

// Actualizar un vehículo existente
// TODO: probar
exports.updateVehiculo = async (req, res) => {
  // try {
  //   const vehiculo = await VehiculoModel.actualizarVehiculo(
  //     req.params.id,
  //     req.body,
  //     {
  //       new: true,
  //     }
  //   );
  //   if (!vehiculo) {
  //     return res.status(404).json({ message: "Vehículo no encontrado" });
  //   }
  //   res.status(200).json(vehiculo);
  // } catch (error) {
  //   res.status(400).json({ message: error.message });
  // }
  res.status(200).json({
    message: "Para esta funcion hace falta creatividad :D, se aceptan PRs",
  });
};

// Eliminar un vehículo
exports.deleteVehiculo = async (req, res) => {
  try {
    const { id, succesful } = await VehiculoModel.eliminarVehiculo(
      req.params.id
    );
    if (!succesful) {
      return res.status(404).json({ message: `Vehículo ${id} no encontrado` });
    }
    res.status(200).json({ message: `Vehículo ${id} eliminado` });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el vehículo",
      error: error.message,
    });
  }
};

// Devuelve el vehiculo + el nombre del cliente
exports.getVehiculoByMatricula = async (req, res) => {
  try {
    const { matricula } = req.params;
    console.log();
    const vehiculo = await VehiculoModel.obtenerVehiculoPorMatricula(matricula);
    if (!vehiculo) {
      return responseHandler.error(res, "Vehículo no encontrado", 404);
    }
    return responseHandler.success(res, vehiculo);
  } catch (error) {
    Logger.error(
      `Error al obtener el vehículo por matrícula: ${error.message}`
    );
    res.status(500).json({
      message: "Error al obtener el vehículo",
      error: error.message,
    });
  }
};

//TODO: Implementar la parte de facturas del modelo para buscar por matricula
// Devuelve el vehiculo + la informacion del cliente + todas las facturas que tiene este vehiculo
exports.getVehiculoByMatriculaExtended = async (req, res) => {
  const { matricula } = req.params;
  try {
    const vehiculo = await VehiculoModel.obtenerVehiculoPorMatricula(matricula);
    // const facturas = await VehiculoModel.obtenerFacturasPorMatricula(matricula);
  } catch (error) {}
};

exports.getMatriculasByMarcaModelo = async (req, res) => {
  try {
    const { cliente_id, marca, modelo } = req.params;
    const vehiculos =
      await VehiculoModel.obtenerVehiculosClientePorMarcaYModelo(
        cliente_id,
        marca,
        modelo
      );
    if (!vehiculos) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }
    res.status(200).json(vehiculos);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el vehículo",
      error: error.message,
    });
  }
};

exports.getModelosByMarca = async (req, res) => {
  try {
    const { cliente_id, marca } = req.params;
    const modelos = await VehiculoModel.getModelosDeMarca(cliente_id, marca);
    if (!modelos) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }
    res.status(200).json(modelos);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el vehículo",
      error: error.message,
    });
  }
};

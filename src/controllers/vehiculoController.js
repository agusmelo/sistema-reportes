const VehiculoModel = require("../model/vehiculos");

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

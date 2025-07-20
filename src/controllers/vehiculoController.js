import VehiculoModel from "../model/vehiculos.js";
import responseHandler from "../utils/responseHandler.js";
import Logger from "../utils/customLog.js";
// Obtener todos los vehículos
export const getVehiculos = async (req, res) => {
  try {
    const vehiculos = await VehiculoModel.obtenerVehiculos();
    res.status(200).json({
      message: "Lista de vehículos obtenida con éxito",
      data: vehiculos,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los vehículos",
      error: error.message,
      data: null,
    });
  }
};

// Obtener un vehículo por ID
export const getVehiculoById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehiculo = await VehiculoModel.obtenerVehiculo(id);
    if (!vehiculo) {
      return res.status(404).json({
        message: "Vehículo no encontrado",
        data: null,
      });
    }
    res.status(200).json({
      message: "Vehículo obtenido con éxito",
      data: vehiculo,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el vehículo",
      error: error.message,
      data: null,
    });
  }
};

export const getVehiculosByClienteId = async (req, res) => {
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
        return res.status(404).json({
          message: "Vehículo no encontrado",
          data: null,
        });
      }
      return res.status(200).json({
        message: "Vehículo encontrado con éxito",
        data: vehiculo,
      });
    }
    const vehiculo = await VehiculoModel.obtenerVehiculoCliente(cliente_id);
    if (!vehiculo) {
      return res.status(404).json({
        message: "Vehículo no encontrado",
        data: null,
      });
    }
    res.status(200).json({
      message: "Vehículos del cliente obtenidos con éxito",
      data: vehiculo,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el vehículo",
      error: error.message,
      data: null,
    });
  }
};

// Crear un nuevo vehículo
export const createVehiculo = async (req, res) => {
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
      message: "Vehículo creado con éxito",
      data: {
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
      data: null,
    });
  }
};

// Actualizar un vehículo existente
// TODO: probar
export const updateVehiculo = async (req, res) => {
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
    data: null,
  });
};

// Eliminar un vehículo
export const deleteVehiculo = async (req, res) => {
  try {
    const { id, succesful } = await VehiculoModel.eliminarVehiculo(
      req.params.id
    );
    if (!succesful) {
      return res.status(404).json({
        message: `Vehículo ${id} no encontrado`,
        data: null,
      });
    }
    res.status(200).json({
      message: `Vehículo ${id} eliminado`,
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el vehículo",
      error: error.message,
      data: null,
    });
  }
};

// Devuelve el vehiculo + el nombre del cliente
export const getVehiculoByMatricula = async (req, res) => {
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
      data: null,
    });
  }
};

//TODO: Implementar la parte de facturas del modelo para buscar por matricula
// Devuelve el vehiculo + la informacion del cliente + todas las facturas que tiene este vehiculo
export const getVehiculoByMatriculaExtended = async (req, res) => {
  const { matricula } = req.params;
  try {
    const vehiculo = await VehiculoModel.obtenerVehiculoPorMatricula(matricula);
    // const facturas = await VehiculoModel.obtenerFacturasPorMatricula(matricula);
  } catch (error) {}
};

export const getMatriculasByMarcaModelo = async (req, res) => {
  try {
    const { cliente_id, marca, modelo } = req.params;
    const vehiculos =
      await VehiculoModel.obtenerVehiculosClientePorMarcaYModelo(
        cliente_id,
        marca,
        modelo
      );
    if (!vehiculos) {
      return res.status(404).json({
        message: "Vehículo no encontrado",
        data: null,
      });
    }
    res.status(200).json({
      message: "Vehículos obtenidos con éxito",
      data: vehiculos,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el vehículo",
      error: error.message,
      data: null,
    });
  }
};

export const getModelosByMarca = async (req, res) => {
  try {
    const { cliente_id, marca } = req.params;
    const modelos = await VehiculoModel.getModelosDeMarca(cliente_id, marca);
    if (!modelos) {
      return res.status(404).json({
        message: "Modelos no encontrados",
        data: null,
      });
    }
    res.status(200).json({
      message: "Modelos obtenidos con éxito",
      data: modelos,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los modelos",
      error: error.message,
      data: null,
    });
  }
};

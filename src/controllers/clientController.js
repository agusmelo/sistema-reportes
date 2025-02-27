const ClientModel = require("../model/clientes");

// TODO: agregar error handling y validacion de tipos
exports.createClient = async (req, res) => {
  const { nombre } = req.body;
  try {
    await ClientModel.agregarCliente(nombre);
    res.status(201).json({
      message: "Usuario creado con éxito",
      nombre: nombre,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear el usuario",
      error: error.message,
    });
  }
};

exports.getAllClients = async (req, res) => {
  try {
    const clientes = await ClientModel.obtenerClientes();
    console.log("clientes: ", clientes);
    res.status(200).json({
      message: "Lista de clientes obtenida con éxito",
      clientes: clientes,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear el usuario",
      error: error.message,
    });
  }
};

exports.getClientById = async (req, res) => {
  const clientId = req.params.id;
  try {
    const dataCliente = await ClientModel.obtenerCliente(clientId);
    if (dataCliente.length === 1) {
      res.status(200).json({
        message: `Cliente ${clientId}`,
        data: dataCliente,
      });
    } else if (dataCliente.length === 0) {
      res.status(404).json({
        message: `No existe cliente con id = ${clientId}`,
      });
    } else {
      res.status(500).json({
        message: `DEV ERROR: Mas de un cliente con id: ${clientId}, algo esta mal.`,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error obteniendo cliente",
    });
  }
};

// TODO: revisar los parametros
exports.updateClient = async (req, res) => {
  const { id: userId, data } = req.params;
  try {
    const data = await ClientModel.actualizarCliente(clientId, data);
    res.status(200).json({
      message: `Cliente ${clientId} actualizado correctamente`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error actualizando cliente",
    });
  }
};

exports.deleteClient = async (req, res) => {
  const clientId = req.params.id;
  try {
    await ClientModel.eliminarCliente(clientId);
    res.status(200).json({
      message: `Cliente ${clientId} eliminado correctamente`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Cliente ${clientId} no se pudo eliminar`,
    });
  }
};

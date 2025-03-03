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
    console.error(error);
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
      message: "Error al obtener los usuarios",
      error: error.message,
    });
  }
};

exports.getClientById = async (req, res) => {
  const clientId = req.params.id;
  try {
    const dataCliente = await ClientModel.obtenerCliente(clientId);
    if (!dataCliente) {
      res.status(404).json({
        message: `No existe cliente con id = ${clientId}`,
      });
    } else {
      res.status(200).json({
        message: `Cliente ${clientId}`,
        data: dataCliente,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener el usuario",
      error: error.message,
    });
  }
};

exports.getClientByName = async (req, res) => {
  const clientName = req.params.name;
  try {
    const dataCliente = await ClientModel.obtenerClientePorNombre(clientName);
    if (!dataCliente) {
      res.status(404).json({
        message: `No existe cliente con nombre = ${clientName}`,
      });
    } else {
      res.status(200).json({
        message: `Cliente ${clientName}`,
        data: dataCliente,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener el usuario",
      error: error.message,
    });
  }
};

// TODO: rehacer
exports.updateClient = async (req, res) => {
  const { id: clientId, data } = req.params;
  try {
    const result = await ClientModel.actualizarCliente(clientId, data);
    res.status(200).json({
      message: `Cliente ${clientId} actualizado correctamente`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al actualizar el usuario",
      error: error.message,
    });
  }
};

exports.deleteClient = async (req, res) => {
  const clientId = req.params.id;
  try {
    await ClientModel.eliminarCliente(clientId);
    // TODO: revisar el mensaje cuando no existe el cliente
    res.status(200).json({
      message: `Cliente ${clientId} eliminado correctamente`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al eliminar el usuario",
      error: error.message,
    });
  }
};

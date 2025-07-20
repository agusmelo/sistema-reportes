import { response } from "express";
import ClientModel from "../model/clientes.js";
import responseHandler from "../utils/responseHandler.js";
// TODO: agregar error handling y validacion de tipos
// if the client already exists, return an error code 409
// if the client does not exist, create a new client
export const createClient = async (req, res) => {
  const { nombre } = req.body;
  try {
    // Check if the client already exists
    const clienteExistente = await ClientModel.obtenerClientePorNombre(nombre);
    if (clienteExistente) {
      console.log(`El cliente ${nombre} ya existe`);
      return responseHandler.fail(
        res,
        { id: clienteExistente.id },
        `El cliente ${nombre} ya existe`,
        409
      );
    }
    await ClientModel.agregarCliente(nombre);
    responseHandler.success(
      res,
      null,
      `Cliente ${nombre} creado con éxito`,
      201
    );
  } catch (error) {
    console.error(error);
    responseHandler.fail(res, null, `Error al crear el cliente ${nombre}`, 500);
  }
};

export const getAllClients = async (req, res) => {
  try {
    const clientes = await ClientModel.obtenerClientes();
    console.log("clientes: ", clientes);
    res.status(200).json({
      message: "Lista de clientes obtenida con éxito",
      data: clientes,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los usuarios",
      error: error.message,
    });
  }
};

export const getClientById = async (req, res) => {
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

export const getClientByName = async (req, res) => {
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
export const updateClient = async (req, res) => {
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

export const deleteClient = async (req, res) => {
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

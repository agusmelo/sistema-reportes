import api from "../api.js";

// Client API service
// TODO: arreglar update y delete
const clientApi = {
  getClients: (params) => {
    return api.get("/clientes/all", { params });
  },

  getClient: (clientId) => {
    return api.get(`/clientes/${clientId}`);
  },

  getClientByName: (clientId) => {
    return api.get(`/clientes/nombre/${clientId}`);
  },

  createClient: (data) => {
    return api.post("/clientes", data);
  },

  updateClient: (clientId, data) => {
    return api.put(`/clientes/${clientId}`, data);
  },

  deleteClient: (clientId) => {
    return api.delete(`/clientes/${clientId}`);
  },
};

const vehicleApi = {
  getVehicles: (params) => {
    return api.get("/vehiculos/all", { params });
  },

  getVehicle: (vehicleId) => {
    return api.get(`/vehiculos/${vehicleId}`);
  },

  getVehicleByClientId: (clientId) => {
    return api.get(`/vehiculos/cliente/${clientId}`);
  },

  getVehicleByMatricula: (matricula) => {
    return api.get(`/vehiculos/matricula/${matricula}`);
  },

  getVehiculoByMatricula: (clientId, marca, modelo) => {
    return api.get(`/vehiculos/matriculas/${clientId}`, {
      params: { marca, modelo },
    });
  },
  createVehicle: (data) => {
    return api.post("/vehiculos", data);
  },

  updateVehicle: (vehicleId, data) => {
    return api.put(`/vehiculos/${vehicleId}`, data);
  },

  deleteVehicle: (vehicleId) => {
    return api.delete(`/vehiculos/${vehicleId}`);
  },
};

export { clientApi, vehicleApi };

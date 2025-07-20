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
    console.log("getVehicleByClientId", clientId);
    return api.get(`/vehiculos/cliente/${clientId}`, { params: {} });
  },

  getVehicleByMatricula: (matricula) => {
    return api.get(`/vehiculos/matricula/${matricula}`);
  },

  getVehicleByClientMarcaModelo: (clientId, marca, modelo) => {
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

const facturaApi = {
  getFacturas: (emergencia) => {
    return api.get("/facturas/all", { params: { emergencia } });
  },

  getFactura: (facturaId) => {
    return api.get(`/facturas/${facturaId}`);
  },

  createFactura: (data, config) => {
    return api.post("/facturas", data, config);
  },
  // TODO: arreglar para generalizar varios options
  // generateFactura: (data, config) => {
  //   return api.post("/facturas/generar", data, config);
  // },
  updateFactura: (facturaId, data) => {
    return api.put(`/facturas/${facturaId}`, data);
  },

  deleteFactura: (facturaId) => {
    return api.delete(`/facturas/${facturaId}`);
  },
};
export { clientApi, vehicleApi, facturaApi };

import httpClient from "../../../core/api/httpClient";
import { endpoints } from "../../../core/api/endpoints";

// Extender endpoints de clientes con update y delete
const clientesEndpoints = {
  getAll:  endpoints.clientes.getAll,
  getOne:  (id) => `/clientes/${id}`,
  create:  endpoints.clientes.create,
  update:  (id) => `/clientes/${id}`,
  delete:  (id) => `/clientes/${id}`,
};

export const getClientes = (soloActivos = false) => {
  const params = soloActivos ? "?activo=true" : "";
  return httpClient.get(`${clientesEndpoints.getAll}${params}`);
};

export const getCliente = (id) => {
  return httpClient.get(clientesEndpoints.getOne(id));
};

export const createCliente = (data) => {
  return httpClient.post(clientesEndpoints.create, data);
};

export const updateCliente = (id, data) => {
  return httpClient.put(clientesEndpoints.update(id), data);
};

export const deleteCliente = (id) => {
  return httpClient.delete(clientesEndpoints.delete(id));
};
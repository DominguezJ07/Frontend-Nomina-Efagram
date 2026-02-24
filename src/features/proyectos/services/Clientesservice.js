import httpClient from "../../../core/api/httpClient";

export const getClientes = (soloActivos = false) => {
  const params = soloActivos ? { activo: true } : {};
  return httpClient.get("/clientes", { params });
};

export const getCliente = (id) => {
  return httpClient.get(`/clientes/${id}`);
};

export const createCliente = (data) => {
  return httpClient.post("/clientes", data);
};

export const updateCliente = (id, data) => {
  return httpClient.put(`/clientes/${id}`, data);
};

export const deleteCliente = (id) => {
  return httpClient.delete(`/clientes/${id}`);
};
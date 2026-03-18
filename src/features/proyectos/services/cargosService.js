import httpClient from "../../../core/api/httpClient";

export const getCargos = () =>
  httpClient.get("/cargos");

export const createCargo = (data) =>
  httpClient.post("/cargos", data);

export const updateCargo = (id, data) =>
  httpClient.put(`/cargos/${id}`, data);

export const deleteCargo = (id) =>
  httpClient.delete(`/cargos/${id}`);
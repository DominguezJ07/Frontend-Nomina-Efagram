import httpClient from "../../../core/api/httpClient";

export const getIntervenciones = () =>
  httpClient.get("/intervenciones");

export const createIntervencion = (data) =>
  httpClient.post("/intervenciones", data);

export const updateIntervencion = (id, data) =>
  httpClient.put(`/intervenciones/${id}`, data);

export const deleteIntervencion = (id) =>
  httpClient.delete(`/intervenciones/${id}`);
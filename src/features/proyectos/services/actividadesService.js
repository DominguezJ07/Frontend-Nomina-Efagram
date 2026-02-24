import httpClient from "../../../core/api/httpClient";

export const getActividades = (params) => {
  return httpClient.get("/actividades", { params });
};

export const createActividad = (data) => {
  return httpClient.post("/actividades", data);
};

export const updateActividad = (id, data) => {
  return httpClient.put(`/actividades/${id}`, data);
};

export const deleteActividad = (id) => {
  return httpClient.delete(`/actividades/${id}`);
};
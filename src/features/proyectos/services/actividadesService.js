import api from "@/shared/api"; // o tu instancia axios

export const getActividades = (params) => {
  return api.get("/actividades", { params });
};

export const createActividad = (data) => {
  return api.post("/actividades", data);
};

export const updateActividad = (id, data) => {
  return api.put(`/actividades/${id}`, data);
};

export const deleteActividad = (id) => {
  return api.delete(`/actividades/${id}`);
};

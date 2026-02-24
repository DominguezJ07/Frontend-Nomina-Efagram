import httpClient from '../../../core/api/httpClient';

// Nota: VITE_API_URL ya incluye /api/v1
// Ej: https://backend-nomina-efagram.onrender.com/api/v1

export const getZonas = async () => {
  const response = await httpClient.get('/zonas');
  return response.data;
};

export const createZona = async (data) => {
  const response = await httpClient.post('/zonas', data);
  return response.data;
};

export const updateZona = async (id, data) => {
  const response = await httpClient.put(`/zonas/${id}`, data);
  return response.data;
};

export const deleteZona = async (id) => {
  const response = await httpClient.delete(`/zonas/${id}`);
  return response.data;
};

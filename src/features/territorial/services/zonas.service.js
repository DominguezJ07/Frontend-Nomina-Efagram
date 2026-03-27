import httpClient from '../../../core/api/httpClient';

export const getZonas = async () => {
  const response = await httpClient.get('/zonas');
  return response.data;
};

export const getNextZonaCode = async () => {
  const response = await httpClient.get('/zonas/next-code');
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
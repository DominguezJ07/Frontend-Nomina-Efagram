import httpClient from '../../../core/api/httpClient';

export const getFincas = async () => {
  const response = await httpClient.get('/fincas');
  return response.data;
};

export const createFinca = async (data) => {
  const response = await httpClient.post('/fincas', data);
  return response.data;
};

export const updateFinca = async (id, data) => {
  const response = await httpClient.put(`/fincas/${id}`, data);
  return response.data;
};

export const deleteFinca = async (id) => {
  const response = await httpClient.delete(`/fincas/${id}`);
  return response.data;
};
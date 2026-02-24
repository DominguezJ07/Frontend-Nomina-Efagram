import httpClient from '../../../core/api/httpClient';

export const getSemanas = async () => {
  const response = await httpClient.get('/semanas');
  return response.data;
};

export const createSemana = async (data) => {
  const response = await httpClient.post('/semanas', data);
  return response.data;
};

export const updateSemana = async (id, data) => {
  const response = await httpClient.put(`/semanas/${id}`, data);
  return response.data;
};

export const deleteSemana = async (id) => {
  const response = await httpClient.delete(`/semanas/${id}`);
  return response.data;
};
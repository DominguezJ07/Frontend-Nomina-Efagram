import httpClient from '../../../core/api/httpClient';

export const getNucleos = async () => {
  const response = await httpClient.get('/nucleos');
  return response.data;
};

export const createNucleo = async (data) => {
  const response = await httpClient.post('/nucleos', data);
  return response.data;
};

export const updateNucleo = async (id, data) => {
  const response = await httpClient.put(`/nucleos/${id}`, data);
  return response.data;
};

export const deleteNucleo = async (id) => {
  const response = await httpClient.delete(`/nucleos/${id}`);
  return response.data;
};
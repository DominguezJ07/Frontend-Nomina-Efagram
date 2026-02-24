import httpClient from '../../../core/api/httpClient';

export const getNovedades = async () => {
  try {
    const response = await httpClient.get('/novedades');
    console.log('STATUS:', response.status);
    console.log('DATA:', response.data);
    return response.data;
  } catch (err) {
    console.error('ERROR ENDPOINT:', err?.response?.status, err?.response?.data);
    throw err;
  }
};

export const createNovedad = async (data) => {
  const response = await httpClient.post('/novedades', data);
  return response.data;
};

export const updateNovedad = async (id, data) => {
  const response = await httpClient.put(`/novedades/${id}`, data);
  return response.data;
};

export const deleteNovedad = async (id) => {
  const response = await httpClient.delete(`/novedades/${id}`);
  return response.data;
};
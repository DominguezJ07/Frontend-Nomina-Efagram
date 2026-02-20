import httpClient from '../../../core/api/httpClient';

export const getRegistros = async () => {
    const response = await httpClient.get('/registros-diarios');
    return response.data;
};

export const createRegistro = async (data) => {
    const response = await httpClient.post('/registros-diarios', data);
    return response.data;
};

export const updateRegistro = async (id, data) => {
    const response = await httpClient.put(`/registros-diarios/${id}`, data);
    return response.data;
};

export const deleteRegistro = async (id) => {
    const response = await httpClient.delete(`/registros-diarios/${id}`);
    return response.data;
};
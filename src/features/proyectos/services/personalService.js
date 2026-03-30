import httpClient from '../../../core/api/httpClient';

export const getPersonal = () =>
  httpClient.get('/personas');

export const createPersona = (data) =>
  httpClient.post('/personas', data);

export const updatePersona = (id, data) =>
  httpClient.put(`/personas/${id}`, data);

export const deletePersona = (id) =>
  httpClient.post(`/personas/${id}/retirar`, { motivo: 'Retiro desde catálogo' });

export const getPersonasBulkTemplateData = () =>
  httpClient.get('/personas/bulk/template-data');

export const bulkUpsertPersonas = (rows) =>
  httpClient.post('/personas/bulk/upsert', { rows });
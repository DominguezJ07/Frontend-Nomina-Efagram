import httpClient from '../../../core/api/httpClient';

// ── Contratos ────────────────────────────────────────────────────
export const getContratos = async (params = {}) => {
  const response = await httpClient.get('/contratos', { params });
  return response.data;
};

export const getContrato = async (id) => {
  const response = await httpClient.get(`/contratos/${id}`);
  return response.data;
};

export const createContrato = async (data) => {
  const response = await httpClient.post('/contratos', data);
  return response.data;
};

export const updateContrato = async (id, data) => {
  const response = await httpClient.put(`/contratos/${id}`, data);
  return response.data;
};

export const cancelarContrato = async (id) => {
  const response = await httpClient.delete(`/contratos/${id}`);
  return response.data;
};

// ── Actividades disponibles de un subproyecto para un contrato ───
// Devuelve: [{ asignacion_id, actividad, cantidad_asignada_subproyecto,
//              cantidad_en_contratos, cantidad_disponible, precio_unitario_referencia, unidad }]
export const getActividadesDisponiblesSubproyecto = async (subproyectoId, excludeContratoId = null) => {
  const params = excludeContratoId ? { excludeContratoId } : {};
  const response = await httpClient.get(
    `/contratos/subproyecto/${subproyectoId}/actividades-disponibles`,
    { params }
  );
  return response.data;
};

// ── Subproyectos (para selector en el modal de contrato) ─────────
export const getSubproyectos = async (params = {}) => {
  const response = await httpClient.get('/subproyectos', { params });
  return response.data;
};

// ── Trabajadores disponibles para un contrato ────────────────────
export const getTrabajadoresDisponibles = async (contratoId, q = '') => {
  const response = await httpClient.get(
    `/contratos/${contratoId}/trabajadores-disponibles`,
    { params: q ? { q } : {} }
  );
  return response.data;
};

// ── Catálogos necesarios para el formulario ──────────────────────
export const getFincas = async () => {
  const response = await httpClient.get('/fincas');
  return response.data;
};

export const getLotesPorFinca = async (fincaId) => {
  const response = await httpClient.get('/lotes', { params: { finca: fincaId } });
  return response.data;
};

export const getCuadrillas = async () => {
  const response = await httpClient.get('/cuadrillas', { params: { activa: true } });
  return response.data;
};

// ── Agregar / remover trabajador de la cuadrilla del contrato ────
export const agregarTrabajadorCuadrilla = async (cuadrillaId, personaId) => {
  const response = await httpClient.post(`/cuadrillas/${cuadrillaId}/miembros`, { personaId });
  return response.data;
};

export const removerTrabajadorCuadrilla = async (cuadrillaId, personaId) => {
  const response = await httpClient.delete(`/cuadrillas/${cuadrillaId}/miembros/${personaId}`);
  return response.data;
};

// ── Búsqueda global de personas (cédula o nombre) ────────────────
export const buscarPersonas = async (q) => {
  const response = await httpClient.get('/personas/buscar', { params: { q } });
  return response.data;
};
import httpClient from '../../../core/api/httpClient';

const reportesService = {

  // Dashboard general (avance metas + actividad + nómina en un solo call)
  getDashboard: async (fechaInicio, fechaFin) => {
    try {
      const params = {};
      if (fechaInicio) params.fecha_inicio = fechaInicio;
      if (fechaFin)    params.fecha_fin    = fechaFin;
      const res = await httpClient.get('/reportes/dashboard', { params });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  // Avance de metas (opcionalmente filtrado por proyecto)
  getAvanceMetas: async (proyectoId, fechaInicio, fechaFin) => {
    try {
      const params = {};
      if (proyectoId)  params.proyecto_id  = proyectoId;
      if (fechaInicio) params.fecha_inicio = fechaInicio;
      if (fechaFin)    params.fecha_fin    = fechaFin;
      const res = await httpClient.get('/reportes/avance-metas', { params });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  // Avance agrupado por actividad
  getPorActividad: async (fechaInicio, fechaFin) => {
    try {
      const params = {};
      if (fechaInicio) params.fecha_inicio = fechaInicio;
      if (fechaFin)    params.fecha_fin    = fechaFin;
      const res = await httpClient.get('/reportes/por-actividad', { params });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  // Nómina general (todos los trabajadores en el período)
  getNominaGeneral: async (fechaInicio, fechaFin) => {
    try {
      const res = await httpClient.get('/reportes/nomina-general', {
        params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  // Nómina de un trabajador específico
  getNominaTrabajador: async (trabajadorId, fechaInicio, fechaFin) => {
    try {
      const res = await httpClient.get(`/reportes/nomina/${trabajadorId}`, {
        params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  // Reporte de una semana operativa
  getReporteSemana: async (semanaId) => {
    try {
      const res = await httpClient.get(`/reportes/semana/${semanaId}`);
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },
};

export default reportesService;
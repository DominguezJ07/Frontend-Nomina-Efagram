// ==========================================
// MODAL: CREAR PROGRAMACIÓN — VERSIÓN FINAL
// ==========================================
// BUGS CORREGIDOS:
//
// BUG #1 — "Error al crear programación" genérico (no muestra el error real):
//   El service lanza `error.response?.data` que es un objeto plano
//   { success:false, message:'...', error:'...' }
//   Al hacer err?.message en un objeto plano = undefined.
//   FIX: leer err?.message || err?.error || err (string fallback).
//
// BUG #2 — Botón deshabilitado cuando no hay cantidadProyectada:
//   La imagen muestra los campos recortados. Si el usuario no llenó
//   cantidadProyectada el botón estaba deshabilitado y no llegaba al backend.
//   Sin embargo la validación frontend mostraba error, no el 400 del backend.
//   FIX: mostrar el error del servidor en el banner del modal.
//
// BUG #3 — fecha_inicial enviada como "YYYY-MM-DD" que en algunos entornos 
//   se interpreta como UTC medianoche → desfase de zona horaria.
//   FIX: enviar como ISO completo con hora del mediodía.

import { useState, useEffect } from 'react';
import { X, AlertCircle, MapPin, Layers, Wrench, Calendar, Hash, DollarSign } from 'lucide-react';

// Helper para extraer mensaje de error de cualquier formato
const getMensajeError = (err) => {
  if (!err) return 'Error desconocido';
  // Si es string directo
  if (typeof err === 'string') return err;
  // Si es objeto con message del servidor
  if (err.message) return err.message;
  // Si es objeto { success:false, message:'...', error:'...' }
  if (err.error)   return err.error;
  // Si tiene errors array (express-validator)
  if (Array.isArray(err.errors) && err.errors[0]?.message) return err.errors[0].message;
  return 'Error al crear programación';
};

export default function ModalCrearProgramacion({ isOpen, onClose, onSave }) {
  const [contratos,            setContratos]            = useState([]);
  const [contratoSeleccionado, setContratoSeleccionado] = useState('');
  const [infoContrato,         setInfoContrato]         = useState(null);
  const [fechaInicial,         setFechaInicial]         = useState('');
  const [cantidadProyectada,   setCantidadProyectada]   = useState('');
  const [valorProyectado,      setValorProyectado]      = useState('');
  const [observaciones,        setObservaciones]        = useState('');
  const [loading,              setLoading]              = useState(true);
  const [guardando,            setGuardando]            = useState(false);
  const [error,                setError]                = useState(null);

  useEffect(() => {
    if (isOpen) {
      setContratoSeleccionado('');
      setInfoContrato(null);
      setFechaInicial('');
      setCantidadProyectada('');
      setValorProyectado('');
      setObservaciones('');
      setError(null);
      cargarContratos();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const cargarContratos = async () => {
    try {
      setLoading(true);
      setError(null);
      const { getContratos } = await import('../../contratos/services/contratosService');
      const response = await getContratos();

      const lista =
        Array.isArray(response?.data)       ? response.data :
        Array.isArray(response?.data?.data) ? response.data.data :
        Array.isArray(response)             ? response : [];

      // Mostrar TODOS los contratos ACTIVOS
      // El filtro estricto de actividades/lotes en frontend descartaba contratos
      // válidos cuando el populate retornaba referencias vacías por docs eliminados.
      // El backend valida al momento de crear → aquí solo filtramos por estado.
      const activos = lista.filter(c => c.estado === 'ACTIVO');
      setContratos(activos);
    } catch (err) {
      setError('Error al cargar contratos: ' + getMensajeError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleContratoChange = (id) => {
    setContratoSeleccionado(id);
    setError(null);
    if (!id) { setInfoContrato(null); return; }
    const c = contratos.find(x => x._id === id);
    setInfoContrato(c || null);
  };

  const handleGuardar = async () => {
    setError(null);

    // Validaciones frontend
    if (!contratoSeleccionado) { setError('Selecciona un contrato'); return; }
    if (!fechaInicial)         { setError('Selecciona la fecha inicial'); return; }

    const cantNum = Number(cantidadProyectada);
    if (!cantidadProyectada || isNaN(cantNum) || cantNum <= 0) {
      setError('Ingresa la cantidad proyectada (mayor a 0)');
      return;
    }

    try {
      setGuardando(true);

      // ✅ FIX BUG #3: enviar fecha como ISO completo (mediodía UTC)
      //    evita desfase de zona horaria en el servidor
      const fechaISO = new Date(fechaInicial + 'T12:00:00.000Z').toISOString();

      const datos = {
        contrato_id:         contratoSeleccionado,
        fecha_inicial:       fechaISO,
        cantidad_proyectada: cantNum,
        valor_proyectado:    Number(valorProyectado) || 0,
        observaciones:       observaciones.trim(),
      };

      await onSave(datos);
      // Si llega aquí = éxito (onSave cierra el modal)
    } catch (err) {
      // ✅ FIX BUG #1: extraer el mensaje real del objeto de error del servidor
      setError(getMensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  // Fecha fin calculada para mostrar
  const fechaFinDisplay = fechaInicial
    ? (() => {
        const d = new Date(fechaInicial + 'T12:00:00Z');
        d.setDate(d.getDate() + 6);
        return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
      })()
    : '—';

  if (!isOpen) return null;

  const inputSt = {
    width: '100%', padding: '9px 12px',
    border: '1.5px solid #d1d5db', borderRadius: 8,
    fontSize: 14, color: '#0f172a', background: '#fff',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  };
  const labelSt = {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: '#374151', marginBottom: 4,
  };
  const chipSt = {
    display: 'inline-block', background: '#f1f5f9',
    border: '1px solid #e2e8f0', borderRadius: 6,
    padding: '3px 10px', fontSize: 12, color: '#334155',
    fontWeight: 500, marginRight: 4, marginBottom: 4,
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(600px, calc(100% - 24px))',
          background: '#fff', borderRadius: 16,
          boxShadow: '0 24px 64px rgba(15,23,42,0.25)',
          display: 'flex', flexDirection: 'column',
          maxHeight: '92vh', overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div style={{
          padding: '20px 24px 16px', borderBottom: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          position: 'sticky', top: 0, background: '#fff', zIndex: 10,
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>
              📅 Nueva Programación
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: '#6b7280' }}>
              Crea una programación semanal de ejecución (7 días)
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f3f4f6', border: '1.5px solid #e5e7eb',
              borderRadius: 8, width: 34, height: 34,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, color: '#374151',
            }}
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* BODY */}
        <div style={{ padding: '20px 24px' }}>

          {/* ✅ Error banner - muestra el error real del servidor */}
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 8, padding: '10px 14px',
              fontSize: 13, color: '#dc2626', marginBottom: 14,
              display: 'flex', alignItems: 'flex-start', gap: 8,
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          {/* CONTRATO */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelSt}>
              Contrato *{' '}
              <span style={{ color: '#94a3b8', fontWeight: 400 }}>
                (contratos activos)
              </span>
            </label>
            {loading ? (
              <div style={{ padding: 10, color: '#64748b', fontSize: 13 }}>
                ⏳ Cargando contratos...
              </div>
            ) : contratos.length === 0 ? (
              <div style={{
                padding: 10, color: '#dc2626', fontSize: 13,
                background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca',
              }}>
                ⚠️ No hay contratos en estado ACTIVO.
                Verifica que el contrato esté en estado ACTIVO en el módulo de Proyectos → Contratos.
              </div>
            ) : (
              <select
                style={inputSt}
                value={contratoSeleccionado}
                onChange={e => handleContratoChange(e.target.value)}
                disabled={guardando}
              >
                <option value="">— Selecciona un contrato —</option>
                {contratos.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.codigo} · {c.finca?.nombre || 'Sin finca'}
                    {c.subproyecto?.nombre ? ` · ${c.subproyecto.nombre}` : ''}
                    {c.cuadrillas?.length > 0 ? ` · ${c.cuadrillas[0]?.nombre || ''}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* INFO CONTRATO */}
          {infoContrato && (
            <div style={{
              background: '#f8fafc', border: '1px solid #e6e8ef',
              borderRadius: 10, padding: '14px 16px', marginBottom: 14,
            }}>
              <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#374151' }}>
                📋 Información del Contrato
              </p>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <MapPin size={14} color="#64748b" style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Finca: </span>
                  <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 500 }}>
                    {infoContrato.finca?.nombre || '—'}
                    {infoContrato.finca?.codigo ? ` (${infoContrato.finca.codigo})` : ''}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <Layers size={14} color="#64748b" style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Lotes: </span>
                  {(infoContrato.lotes || []).map((l, idx) => (
                    <span key={l?._id || idx} style={chipSt}>{l?.nombre || l?.codigo || `Lote ${idx + 1}`}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <Wrench size={14} color="#64748b" style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Actividades: </span>
                  {(infoContrato.actividades || []).map((a, idx) => {
                    // ✅ FIX: cada elemento es { actividad:{_id,nombre,...}, cantidad, precio_unitario }
                    // NO es la actividad directamente — hay que acceder a a.actividad
                    const act = a?.actividad;
                    const label = act?.nombre || act?.codigo || `Actividad ${idx + 1}`;
                    const key = act?._id || idx;
                    return (
                      <span key={key} style={chipSt}>{label}</span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* FECHAS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px', marginBottom: 14 }}>
            <div>
              <label style={labelSt}>
                <Calendar size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Fecha Inicial *
              </label>
              <input
                type="date"
                style={inputSt}
                value={fechaInicial}
                onChange={e => setFechaInicial(e.target.value)}
                disabled={guardando}
              />
            </div>
            <div>
              <label style={labelSt}>
                <Calendar size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Fecha Final (calculada)
              </label>
              <div style={{
                ...inputSt, background: '#f1f5f9', color: '#64748b',
                display: 'flex', alignItems: 'center',
              }}>
                {fechaFinDisplay}
              </div>
              <small style={{ color: '#94a3b8', fontSize: 11, marginTop: 2, display: 'block' }}>
                Inicio + 6 días = 7 días de semana
              </small>
            </div>
          </div>

          {/* PROYECTADO */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px', marginBottom: 14 }}>
            <div>
              <label style={labelSt}>
                <Hash size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Cantidad Proyectada *
              </label>
              <input
                type="number" min="0.01" step="0.01"
                style={inputSt}
                placeholder="Ej: 2.5"
                value={cantidadProyectada}
                onChange={e => setCantidadProyectada(e.target.value)}
                disabled={guardando}
              />
            </div>
            <div>
              <label style={labelSt}>
                <DollarSign size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Valor Proyectado ($)
              </label>
              <input
                type="number" min="0" step="1"
                style={inputSt}
                placeholder="Ej: 800000"
                value={valorProyectado}
                onChange={e => setValorProyectado(e.target.value)}
                disabled={guardando}
              />
            </div>
          </div>

          {/* OBSERVACIONES */}
          <div>
            <label style={labelSt}>Observaciones</label>
            <textarea
              style={{ ...inputSt, resize: 'vertical' }}
              rows={3}
              placeholder="Notas adicionales..."
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              disabled={guardando}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div style={{
          padding: '14px 24px', borderTop: '1px solid #e5e7eb',
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          position: 'sticky', bottom: 0, background: '#fff',
        }}>
          <button
            onClick={onClose}
            disabled={guardando}
            style={{
              background: '#f9fafb', color: '#374151',
              border: '1px solid #d1d5db', padding: '10px 20px',
              borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando || loading || !contratoSeleccionado || !fechaInicial || !cantidadProyectada}
            style={{
              background: (guardando || loading || !contratoSeleccionado || !fechaInicial || !cantidadProyectada)
                ? '#9ca3af' : '#1f8f57',
              color: '#fff', border: 'none',
              padding: '10px 24px', borderRadius: 8,
              fontWeight: 700, fontSize: 14,
              cursor: (guardando || loading || !contratoSeleccionado || !fechaInicial || !cantidadProyectada)
                ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(31,143,87,0.2)',
            }}
          >
            {guardando ? ' Creando...' : ' Crear Programación'}
          </button>
        </div>
      </div>
    </div>
  );
}
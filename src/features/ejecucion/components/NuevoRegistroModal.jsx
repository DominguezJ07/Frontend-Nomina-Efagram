import { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';

const BASE_URL = 'https://backend-nomina-efagram.onrender.com/api/v1';
const getToken = () => localStorage.getItem('efagram_token') ?? '';

const fetchJSON = async (url) => {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  const data = await res.json();
  return data.data ?? [];
};

// ── Fix: sin mezclar ?? con || en la misma expresión ──────────────────────
const getNombre = (p) => {
  if (!p) return 'Sin nombre';
  if (p.nombreCompleto) return p.nombreCompleto;
  const full = `${p.nombres || ''} ${p.apellidos || ''}`.trim();
  return full || 'Sin nombre';
};

export default function NuevoRegistroModal({
  isOpen,
  title = 'Nuevo Registro',
  initialValues = {},
  onClose,
  onSubmit,
}) {
  // ── Campos del formulario ─────────────────────────────────────────────
  const [fecha,                   setFecha]         = useState('');
  const [proyecto_actividad_lote, setPal]            = useState('');
  const [cuadrilla,               setCuadrilla]     = useState('');
  const [cantidad_ejecutada,      setCantidad]      = useState('');
  const [horas_trabajadas,        setHoras]         = useState('8');
  const [hora_inicio,             setHoraInicio]    = useState('07:00');
  const [hora_fin,                setHoraFin]       = useState('17:00');
  const [observaciones,           setObservaciones] = useState('');
  const [estado,                  setEstado]        = useState('PENDIENTE');
  const [motivo_edicion,          setMotivoEdicion] = useState('');

  // Trabajadores seleccionados (solo creación)
  const [selectedTrabajadores, setSelectedTrabajadores] = useState([]);

  // ── Datos del servidor ────────────────────────────────────────────────
  const [pals,        setPals]        = useState([]);
  const [cuadrillas,  setCuadrillas]  = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState(null);

  // ── Miembros activos de la cuadrilla elegida ──────────────────────────
  const miembrosActivos = (() => {
    if (!cuadrilla) return [];
    const c = cuadrillas.find((x) => x._id === cuadrilla);
    if (!c) return [];
    return (c.miembros || []).filter((m) => m.activo && m.persona);
  })();

  // ── Inicializar al abrir ──────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    setFecha(initialValues.fecha || '');
    setPal(initialValues.proyecto_actividad_lote || '');
    setCuadrilla(initialValues.cuadrilla || '');
    setCantidad(String(initialValues.cantidad_ejecutada || ''));
    setHoras(String(initialValues.horas_trabajadas || '8'));
    setHoraInicio(initialValues.hora_inicio || '07:00');
    setHoraFin(initialValues.hora_fin || '17:00');
    setObservaciones(initialValues.observaciones || '');
    setEstado(initialValues.estado || 'PENDIENTE');
    setMotivoEdicion('');
    setSelectedTrabajadores([]);
    setError(null);
    setSaving(false);

    setLoadingData(true);
    Promise.all([
      fetchJSON(`${BASE_URL}/pals`),
      fetchJSON(`${BASE_URL}/cuadrillas`),
    ])
      .then(([ps, cs]) => {
        setPals(ps);
        setCuadrillas(cs.filter((c) => c.activa));
      })
      .catch((e) => console.error('Error cargando datos:', e))
      .finally(() => setLoadingData(false));
  }, [isOpen]);

  // Resetear selección al cambiar cuadrilla
  useEffect(() => {
    setSelectedTrabajadores([]);
  }, [cuadrilla]);

  if (!isOpen) return null;

  const isEdit = title.toLowerCase().includes('editar');
  const busy   = saving || loadingData;

  // ── Toggle trabajador ─────────────────────────────────────────────────
  const toggleTrabajador = (personaId) => {
    setSelectedTrabajadores((prev) =>
      prev.includes(personaId)
        ? prev.filter((id) => id !== personaId)
        : [...prev, personaId]
    );
  };

  const selectAll = () =>
    setSelectedTrabajadores(
      miembrosActivos.map((m) => (m.persona._id || m.persona))
    );

  const clearAll = () => setSelectedTrabajadores([]);

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!fecha)                   return setError('La fecha es obligatoria');
    if (!proyecto_actividad_lote) return setError('El PAL es obligatorio');
    if (!cantidad_ejecutada)      return setError('La cantidad ejecutada es obligatoria');
    if (isEdit && !motivo_edicion) return setError('El motivo de edición es obligatorio');

    if (!isEdit && cuadrilla && miembrosActivos.length > 0 && selectedTrabajadores.length === 0) {
      return setError('Selecciona al menos un trabajador de la cuadrilla');
    }

    const base = {
      fecha,
      proyecto_actividad_lote,
      ...(cuadrilla && { cuadrilla }),
      cantidad_ejecutada: Number(cantidad_ejecutada),
      horas_trabajadas:   Number(horas_trabajadas),
      hora_inicio,
      hora_fin,
      estado,
      ...(observaciones.trim() && { observaciones: observaciones.trim() }),
      ...(isEdit && motivo_edicion && { motivo_edicion: motivo_edicion.trim() }),
    };

    const payload =
      !isEdit && selectedTrabajadores.length > 0
        ? { ...base, trabajadores: selectedTrabajadores }
        : base;

    try {
      setSaving(true);
      await onSubmit?.(payload);
    } catch (err) {
      setError(
        (err && err.response && err.response.data && err.response.data.message) ||
        (err && err.message) ||
        'No se pudo guardar'
      );
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="nrm-backdrop" onClick={onClose}>
      <div
        className="nrm-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="nrm-header">
          <div>
            <h3 className="nrm-title">{title}</h3>
            <p className="nrm-subtitle">Completa los datos del registro diario</p>
          </div>
          <button className="nrm-close-btn" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="nrm-form" onSubmit={handleSubmit}>
          <div className="nrm-scroll-area">

            {/* Fecha */}
            <div className="nrm-field">
              <label className="nrm-label">Fecha <span className="nrm-req">*</span></label>
              <input
                className="nrm-input"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>

            {/* PAL */}
            <div className="nrm-field">
              <label className="nrm-label">
                PAL (Proyecto · Actividad · Lote) <span className="nrm-req">*</span>
              </label>
              <select
                className="nrm-select"
                value={proyecto_actividad_lote}
                onChange={(e) => setPal(e.target.value)}
                required
                disabled={loadingData}
              >
                <option value="">{loadingData ? 'Cargando...' : '-- Selecciona un PAL --'}</option>
                {pals.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.codigo} — {p.estado}
                  </option>
                ))}
              </select>
            </div>

            {/* Cuadrilla */}
            <div className="nrm-field">
              <label className="nrm-label">
                Cuadrilla <span className="nrm-opt">(opcional)</span>
              </label>
              <select
                className="nrm-select"
                value={cuadrilla}
                onChange={(e) => setCuadrilla(e.target.value)}
                disabled={loadingData}
              >
                <option value="">{loadingData ? 'Cargando...' : '-- Sin cuadrilla --'}</option>
                {cuadrillas.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* ── Selección de trabajadores (solo al crear con cuadrilla) ── */}
            {!isEdit && cuadrilla && (
              <div className="nrm-field">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label className="nrm-label" style={{ margin: 0 }}>
                    Trabajadores <span className="nrm-req">*</span>
                    <span style={{ fontWeight: 400, color: '#6b7280', marginLeft: 6, fontSize: 12 }}>
                      ({selectedTrabajadores.length}/{miembrosActivos.length} seleccionados)
                    </span>
                  </label>
                  {miembrosActivos.length > 0 && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={selectAll}
                        style={{ fontSize: 11, color: '#059669', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                      >
                        Todos
                      </button>
                      <span style={{ color: '#d1d5db', fontSize: 11 }}>|</span>
                      <button
                        type="button"
                        onClick={clearAll}
                        style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                      >
                        Ninguno
                      </button>
                    </div>
                  )}
                </div>

                {/* Sin miembros */}
                {miembrosActivos.length === 0 && (
                  <div style={{ padding: '10px 12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12.5, color: '#9ca3af', fontStyle: 'italic' }}>
                    Esta cuadrilla no tiene miembros activos
                  </div>
                )}

                {/* Lista checkboxes */}
                {miembrosActivos.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto', padding: '2px 0' }}>
                    {miembrosActivos.map((m, idx) => {
                      const p       = m.persona;
                      const pid     = (p && (p._id || p)) || idx;
                      const nombre  = getNombre(p);
                      const cargo   = (p && p.cargo) || 'Sin cargo';
                      const checked = selectedTrabajadores.includes(pid);

                      return (
                        <div
                          key={String(pid)}
                          onClick={() => toggleTrabajador(pid)}
                          style={{
                            display:         'flex',
                            alignItems:      'center',
                            justifyContent:  'space-between',
                            padding:         '8px 12px',
                            backgroundColor: checked ? '#f0fdf4' : '#f9fafb',
                            border:          `1px solid ${checked ? '#86efac' : '#e5e7eb'}`,
                            borderRadius:    8,
                            cursor:          'pointer',
                            transition:      'all 0.15s ease',
                            userSelect:      'none',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {/* Checkbox visual */}
                            <div style={{
                              width:           20,
                              height:          20,
                              borderRadius:    5,
                              border:          `2px solid ${checked ? '#059669' : '#d1d5db'}`,
                              backgroundColor: checked ? '#059669' : '#fff',
                              display:         'flex',
                              alignItems:      'center',
                              justifyContent:  'center',
                              flexShrink:      0,
                              transition:      'all 0.15s ease',
                            }}>
                              {checked && <Check size={12} color="#fff" strokeWidth={3} />}
                            </div>

                            {/* Avatar */}
                            <div style={{
                              width:           30,
                              height:          30,
                              borderRadius:    '50%',
                              backgroundColor: checked ? '#d1fae5' : '#e5e7eb',
                              color:           checked ? '#065f46' : '#6b7280',
                              display:         'flex',
                              alignItems:      'center',
                              justifyContent:  'center',
                              fontSize:        12,
                              fontWeight:      700,
                              flexShrink:      0,
                            }}>
                              {nombre.charAt(0).toUpperCase()}
                            </div>

                            <span style={{ fontSize: 13, color: '#111827', fontWeight: checked ? 600 : 400 }}>
                              {nombre}
                            </span>
                          </div>

                          {/* Cargo */}
                          <span style={{
                            fontSize:        11.5,
                            color:           checked ? '#065f46' : '#6b7280',
                            backgroundColor: checked ? '#dcfce7' : '#e5e7eb',
                            padding:         '2px 10px',
                            borderRadius:    12,
                            fontWeight:      500,
                            whiteSpace:      'nowrap',
                            transition:      'all 0.15s ease',
                          }}>
                            {cargo}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Cant. Ejecutada + Horas */}
            <div className="nrm-row">
              <div className="nrm-field">
                <label className="nrm-label">
                  Cant. Ejecutada <span className="nrm-req">*</span>
                </label>
                <input
                  className="nrm-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={cantidad_ejecutada}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="Ej: 0.7"
                  required
                />
              </div>
              <div className="nrm-field">
                <label className="nrm-label">Horas Trabajadas</label>
                <input
                  className="nrm-input"
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={horas_trabajadas}
                  onChange={(e) => setHoras(e.target.value)}
                  placeholder="Ej: 8"
                />
              </div>
            </div>

            {/* Hora inicio + Hora fin */}
            <div className="nrm-row">
              <div className="nrm-field">
                <label className="nrm-label">Hora Inicio</label>
                <input
                  className="nrm-input"
                  type="time"
                  value={hora_inicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                />
              </div>
              <div className="nrm-field">
                <label className="nrm-label">Hora Fin</label>
                <input
                  className="nrm-input"
                  type="time"
                  value={hora_fin}
                  onChange={(e) => setHoraFin(e.target.value)}
                />
              </div>
            </div>

            {/* Observaciones */}
            <div className="nrm-field">
              <label className="nrm-label">Observaciones</label>
              <textarea
                className="nrm-textarea"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej: Día normal de trabajo"
                rows={2}
              />
            </div>

            {/* Estado */}
            <div className="nrm-field">
              <label className="nrm-label">Estado</label>
              <select
                className="nrm-select"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="APROBADO">Aprobado</option>
                <option value="RECHAZADO">Rechazado</option>
              </select>
            </div>

            {/* Motivo edición — solo al editar */}
            {isEdit && (
              <div className="nrm-field">
                <label className="nrm-label">
                  Motivo de edición <span className="nrm-req">*</span>
                </label>
                <textarea
                  className="nrm-textarea"
                  value={motivo_edicion}
                  onChange={(e) => setMotivoEdicion(e.target.value)}
                  placeholder="Describe brevemente el motivo de la corrección"
                  rows={2}
                />
              </div>
            )}

            {error && <div className="nrm-error">{error}</div>}
          </div>

          <div className="nrm-footer">
            <button className="btn-modal-cancel" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn-modal-submit" type="submit" disabled={busy}>
              {saving
                ? 'Guardando…'
                : isEdit
                  ? 'Guardar cambios'
                  : selectedTrabajadores.length > 1
                    ? `Crear ${selectedTrabajadores.length} registros`
                    : 'Crear registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
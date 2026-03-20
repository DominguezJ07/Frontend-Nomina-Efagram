import { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle2, Calendar, Hash, ClipboardList, PauseCircle } from 'lucide-react';
import programacionService from '../services/programacionService';

const ESTADO_COLOR = {
  COMPLETADO: { bg: '#dcfce7', color: '#16a34a', label: 'Completado' },
  PENDIENTE:  { bg: '#fef9c3', color: '#ca8a04', label: 'Pendiente'  },
  SIN_DATOS:  { bg: '#f1f5f9', color: '#64748b', label: 'Sin datos'  },
};

const MOTIVOS_DETENCION = [
  { value: '',              label: '— Seleccionar motivo —' },
  { value: 'lluvia',        label: '🌧 Lluvia' },
  { value: 'trafico',       label: '🚧 Tráfico en la vía' },
  { value: 'falla_equipo',  label: '⚙️ Falla de equipo' },
  { value: 'accidente',     label: '🚨 Accidente' },
  { value: 'orden_cliente', label: '📋 Orden del cliente' },
  { value: 'descanso',      label: '☕ Descanso no programado' },
  { value: 'otro',          label: '📝 Otro' },
];

export default function ModalRegistroEjecucion({ isOpen, onClose, programacion }) {
  const [dias,         setDias]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [guardando,    setGuardando]    = useState(false);
  const [error,        setError]        = useState(null);
  const [success,      setSuccess]      = useState(null);
  const [metaPrograma, setMetaPrograma] = useState(null);

  useEffect(() => {
    if (isOpen && programacion?._id) cargarRegistros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, programacion?._id]);

  const cargarRegistros = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await programacionService.getRegistrosDiarios(programacion._id);
      const data     = response?.data;
      const diasData = data?.dias || [];
      setDias(diasData.map(d => ({ ...d })));
      setMetaPrograma({
        cantidad_proyectada:      data?.cantidad_proyectada      ?? programacion.cantidad_proyectada,
        cantidad_ejecutada_total: data?.cantidad_ejecutada_total ?? programacion.cantidad_ejecutada_total ?? 0,
        porcentaje_cumplimiento:  data?.porcentaje_cumplimiento  ?? programacion.porcentaje_cumplimiento  ?? 0,
      });
    } catch (err) {
      setError(err?.message || err?.error || 'Error al cargar registros diarios');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarCantidad = (index, valor) => {
    const cantidad = parseFloat(valor) || 0;
    setDias(prev => prev.map((d, i) =>
      i === index
        ? { ...d, cantidad_ejecutada: cantidad, estado: cantidad > 0 ? 'COMPLETADO' : 'PENDIENTE' }
        : d
    ));
  };

  const handleCambiarObservaciones = (index, valor) => {
    setDias(prev => prev.map((d, i) => i === index ? { ...d, observaciones: valor } : d));
  };

  const handleCambiarTiempoDetenido = (index, valor) => {
    const horas = parseFloat(valor) || 0;
    setDias(prev => prev.map((d, i) => i === index ? { ...d, tiempo_detenido: horas } : d));
  };

  const handleCambiarMotivoDetencion = (index, valor) => {
    setDias(prev => prev.map((d, i) => i === index ? { ...d, motivo_detencion: valor } : d));
  };

  const handleCambiarMotivoPersonalizado = (index, valor) => {
    setDias(prev => prev.map((d, i) => i === index ? { ...d, motivo_detencion_otro: valor } : d));
  };

  const totalEjecutado = dias.reduce((s, d) => s + (d.cantidad_ejecutada || 0), 0);
  const cantProyectada = metaPrograma?.cantidad_proyectada || programacion?.cantidad_proyectada || 1;
  const porcentaje     = Math.min(200, Math.round((totalEjecutado / cantProyectada) * 100));
  const barColor       = porcentaje >= 100 ? '#16a34a' : porcentaje >= 50 ? '#f59e0b' : '#3b82f6';

  const handleGuardar = async () => {
    try {
      setGuardando(true);
      setError(null);
      const registrosActualizar = dias.map(d => ({
        id:                       d._id,
        cantidad_ejecutada:       d.cantidad_ejecutada        ?? 0,
        observaciones:            d.observaciones             ?? '',
        tiempo_detenido:          d.tiempo_detenido           ?? 0,
        motivo_detencion:         d.motivo_detencion          ?? '',
        motivo_detencion_otro:    d.motivo_detencion_otro     ?? '',
      }));
      const response = await programacionService.updateMultiplesRegistros(registrosActualizar);
      if (response?.success) {
        setSuccess('Registros guardados exitosamente');
        setTimeout(() => onClose(), 1500);
      } else {
        throw new Error(response?.message || 'No se pudo guardar');
      }
    } catch (err) {
      setError(err?.message || err?.error || 'Error al guardar registros');
    } finally {
      setGuardando(false);
    }
  };

  if (!isOpen) return null;

  // ── Fecha formateada corta
  const fmtFecha = (iso) =>
    iso ? new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(820px, 100%)',
          background: '#ffffff',
          borderRadius: 18,
          boxShadow: '0 24px 64px rgba(15,23,42,0.18)',
          display: 'flex', flexDirection: 'column',
          maxHeight: '92vh',
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
        }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── HEADER ── */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ClipboardList size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
              Registrar Ejecución — Contrato {programacion?.contrato?.codigo || programacion?.contrato}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
              {[programacion?.finca?.nombre, programacion?.actividad?.nombre].filter(Boolean).join(' · ')}
              {programacion?.fecha_inicial && (
                <> · {fmtFecha(programacion.fecha_inicial)} → {fmtFecha(programacion.fecha_final)}</>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f3f4f6', border: '1.5px solid #e5e7eb',
              borderRadius: 8, width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#6b7280', flexShrink: 0,
            }}
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* ── BARRA DE PROGRESO ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 20,
          padding: '12px 24px',
          borderBottom: '1px solid #f0f0f0',
          background: '#fafafa',
          flexShrink: 0, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 13, color: '#374151' }}>
            <strong>Proyectado:</strong> {cantProyectada}
          </span>
          <span style={{ fontSize: 13, color: '#374151' }}>
            <strong>Ejecutado:</strong> {totalEjecutado.toFixed(2)}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 180 }}>
            <span style={{ fontSize: 13, color: '#374151', fontWeight: 600, flexShrink: 0 }}>Progreso:</span>
            <div style={{ flex: 1, height: 10, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, porcentaje)}%`,
                height: '100%', background: barColor,
                borderRadius: 99, transition: 'width 0.3s',
              }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: barColor, flexShrink: 0 }}>
              {porcentaje}%
            </span>
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ padding: '18px 24px', overflowY: 'auto', flex: 1 }}>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
              padding: '10px 14px', marginBottom: 14,
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 13, color: '#dc2626',
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8,
              padding: '10px 14px', marginBottom: 14,
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 13, color: '#16a34a',
            }}>
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              {success}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af', fontSize: 14 }}>
              ⏳ Cargando registros diarios...
            </div>
          ) : dias.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: 48, color: '#6b7280',
              background: '#f9fafb', borderRadius: 12, border: '1px dashed #e5e7eb',
            }}>
              <p style={{ fontSize: 36, margin: '0 0 8px' }}>📭</p>
              <p style={{ fontWeight: 700, color: '#374151', margin: '0 0 4px' }}>No se encontraron registros diarios</p>
              <p style={{ fontSize: 13, margin: 0 }}>
                Esta programación no tiene los 7 registros creados. Elimínala y vuelve a crearla.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
              gap: 14,
            }}>
              {dias.map((dia, index) => {
                const est     = dia.estado || 'PENDIENTE';
                const estInfo = ESTADO_COLOR[est] || ESTADO_COLOR.PENDIENTE;
                const fechaObj = new Date(dia.fecha);
                const nombreDia = dia.dia_semana
                  || ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][fechaObj.getDay()];

                return (
                  <div
                    key={dia._id || index}
                    style={{
                      border: '1.5px solid #e5e7eb',
                      borderRadius: 12,
                      background: '#ffffff',
                      padding: '16px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    }}
                  >
                    {/* Encabezado del día */}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', marginBottom: 12,
                    }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#111827' }}>
                          {nombreDia}
                        </p>
                        <p style={{
                          margin: '3px 0 0', fontSize: 12, color: '#6b7280',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          <Calendar size={11} />
                          {fechaObj.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <span style={{
                        padding: '4px 10px', borderRadius: 99,
                        fontSize: 11, fontWeight: 600,
                        background: estInfo.bg, color: estInfo.color,
                      }}>
                        {estInfo.label}
                      </span>
                    </div>

                    {/* Cantidad ejecutada */}
                    <div style={{ marginBottom: 10 }}>
                      <label style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 5,
                      }}>
                        <Hash size={11} /> Cantidad ejecutada
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={dia.cantidad_ejecutada || ''}
                        onChange={e => handleCambiarCantidad(index, e.target.value)}
                        disabled={guardando}
                        placeholder="0"
                        style={{
                          width: '100%', padding: '8px 12px',
                          border: '1.5px solid #d1d5db', borderRadius: 8,
                          fontSize: 14, fontWeight: 600, color: '#111827',
                          outline: 'none', boxSizing: 'border-box',
                          background: '#fff',
                        }}
                      />
                    </div>

                    {/* Observaciones */}
                    <div>
                      <label style={{
                        display: 'block', fontSize: 12,
                        fontWeight: 600, color: '#6b7280', marginBottom: 5,
                      }}>
                        Observaciones
                      </label>
                      <textarea
                        value={dia.observaciones || ''}
                        onChange={e => handleCambiarObservaciones(index, e.target.value)}
                        disabled={guardando}
                        rows={2}
                        placeholder="Notas del día..."
                        style={{
                          width: '100%', padding: '8px 12px',
                          border: '1.5px solid #d1d5db', borderRadius: 8,
                          fontSize: 12, color: '#374151',
                          resize: 'vertical', outline: 'none',
                          boxSizing: 'border-box', fontFamily: 'inherit',
                          background: '#fff',
                        }}
                      />
                    </div>

                    {/* Separador jornada detenida */}
                    <div style={{
                      margin: '12px 0 10px',
                      borderTop: '1px dashed #e5e7eb',
                      paddingTop: 10,
                    }}>
                      <p style={{
                        margin: '0 0 8px', fontSize: 11, fontWeight: 700,
                        color: '#b45309', textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'flex', alignItems: 'center', gap: 5,
                      }}>
                        <PauseCircle size={12} />
                        Jornada detenida
                      </p>

                      {/* Tiempo detenido */}
                      <div style={{ marginBottom: 8 }}>
                        <label style={{
                          display: 'block', fontSize: 12,
                          fontWeight: 600, color: '#6b7280', marginBottom: 5,
                        }}>
                          Tiempo detenido (horas)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="24"
                          step="0.5"
                          value={dia.tiempo_detenido || ''}
                          onChange={e => handleCambiarTiempoDetenido(index, e.target.value)}
                          disabled={guardando}
                          placeholder="0"
                          style={{
                            width: '100%', padding: '8px 12px',
                            border: '1.5px solid #fcd34d', borderRadius: 8,
                            fontSize: 14, fontWeight: 600, color: '#92400e',
                            outline: 'none', boxSizing: 'border-box',
                            background: '#fffbeb',
                          }}
                        />
                      </div>

                      {/* Motivo de detención */}
                      <div style={{ marginBottom: dia.motivo_detencion === 'otro' ? 8 : 0 }}>
                        <label style={{
                          display: 'block', fontSize: 12,
                          fontWeight: 600, color: '#6b7280', marginBottom: 5,
                        }}>
                          Motivo de detención
                        </label>
                        <select
                          value={dia.motivo_detencion || ''}
                          onChange={e => handleCambiarMotivoDetencion(index, e.target.value)}
                          disabled={guardando}
                          style={{
                            width: '100%', padding: '8px 12px',
                            border: '1.5px solid #fcd34d', borderRadius: 8,
                            fontSize: 12, color: dia.motivo_detencion ? '#92400e' : '#9ca3af',
                            outline: 'none', boxSizing: 'border-box',
                            background: '#fffbeb', fontFamily: 'inherit',
                            cursor: 'pointer',
                          }}
                        >
                          {MOTIVOS_DETENCION.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Campo libre si seleccionó "Otro" */}
                      {dia.motivo_detencion === 'otro' && (
                        <div>
                          <label style={{
                            display: 'block', fontSize: 12,
                            fontWeight: 600, color: '#6b7280', marginBottom: 5,
                          }}>
                            Especificar motivo
                          </label>
                          <input
                            type="text"
                            value={dia.motivo_detencion_otro || ''}
                            onChange={e => handleCambiarMotivoPersonalizado(index, e.target.value)}
                            disabled={guardando}
                            placeholder="Describe el motivo..."
                            style={{
                              width: '100%', padding: '8px 12px',
                              border: '1.5px solid #fcd34d', borderRadius: 8,
                              fontSize: 12, color: '#92400e',
                              outline: 'none', boxSizing: 'border-box',
                              background: '#fffbeb', fontFamily: 'inherit',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #f0f0f0',
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          flexShrink: 0,
          background: '#fff',
          borderRadius: '0 0 18px 18px',
        }}>
          <button
            onClick={onClose}
            disabled={guardando}
            style={{
              background: '#fff', color: '#374151',
              border: '1.5px solid #d1d5db', padding: '10px 22px',
              borderRadius: 8, fontWeight: 600, cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando || loading || dias.length === 0}
            style={{
              background: (guardando || loading || dias.length === 0) ? '#9ca3af' : '#16a34a',
              color: '#fff', border: 'none',
              padding: '10px 24px', borderRadius: 8,
              fontWeight: 700, fontSize: 14,
              cursor: (guardando || loading || dias.length === 0) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <Save size={15} />
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

      </div>
    </div>
  );
}
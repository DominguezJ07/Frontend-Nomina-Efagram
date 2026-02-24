import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function NuevaSemanaModal({
  isOpen, title = 'Nueva Semana', initialValues = {}, onClose, onSubmit,
}) {
  const [codigo,        setCodigo]        = useState('');
  const [fecha_inicio,  setFechaInicio]   = useState('');
  const [fecha_fin,     setFechaFin]      = useState('');
  // CORRECCIÓN: estado inicial era 'ACTIVA' — el enum del backend es ABIERTA | CERRADA | BLOQUEADA
  const [estado,        setEstado]        = useState('ABIERTA');
  const [registros,     setRegistros]     = useState('');
  const [cumplimiento,  setCumplimiento]  = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setCodigo(initialValues?.codigo ?? initialValues?.semana ?? '');
    setFechaInicio(initialValues?.fecha_inicio ? String(initialValues.fecha_inicio).slice(0, 10) : '');
    setFechaFin(initialValues?.fecha_fin ? String(initialValues.fecha_fin).slice(0, 10) : '');
    // CORRECCIÓN: default era 'ACTIVA'
    setEstado(initialValues?.estado ?? 'ABIERTA');
    setRegistros(String(initialValues?.registros ?? ''));
    setCumplimiento(String(initialValues?.cumplimiento ?? ''));
    setObservaciones(initialValues?.observaciones ?? '');
    setError(null);
    setSaving(false);
  }, [isOpen, initialValues]);

  if (!isOpen) return null;

  const isEdit = title.toLowerCase().includes('editar');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!fecha_inicio) return setError('La fecha de inicio es obligatoria');
    if (!fecha_fin)    return setError('La fecha de fin es obligatoria');

    const payload = {
      ...(codigo.trim() && { codigo: codigo.trim() }),
      fecha_inicio,
      fecha_fin,
      estado,
      ...(registros    && { registros: Number(registros) }),
      ...(cumplimiento && { cumplimiento: Number(cumplimiento) }),
      ...(observaciones.trim() && { observaciones: observaciones.trim() }),
    };

    try {
      setSaving(true);
      await onSubmit?.(payload);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'No se pudo guardar');
      setSaving(false);
    }
  };

  return (
    <div className="nrm-backdrop" onClick={onClose}>
      <div className="nrm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">

        <div className="nrm-header">
          <div>
            <h3 className="nrm-title">{title}</h3>
            <p className="nrm-subtitle">Completa los datos de la semana operativa</p>
          </div>
          <button className="nrm-close-btn" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="nrm-form" onSubmit={handleSubmit}>
          <div className="nrm-scroll-area">

            <div className="nrm-field">
              <label className="nrm-label">Código <span className="nrm-opt">(opcional, ej: SEM-2026-07)</span></label>
              <input className="nrm-input" value={codigo}
                onChange={(e) => setCodigo(e.target.value)} placeholder="Ej: SEM-2026-07" autoFocus />
            </div>

            <div className="nrm-row">
              <div className="nrm-field">
                <label className="nrm-label">Fecha Inicio <span className="nrm-req">*</span></label>
                <input className="nrm-input" type="date" value={fecha_inicio}
                  onChange={(e) => setFechaInicio(e.target.value)} required />
              </div>
              <div className="nrm-field">
                <label className="nrm-label">Fecha Fin <span className="nrm-req">*</span></label>
                <input className="nrm-input" type="date" value={fecha_fin}
                  onChange={(e) => setFechaFin(e.target.value)} required />
              </div>
            </div>

            <div className="nrm-field">
              <label className="nrm-label">Estado</label>
              {/* CORRECCIÓN: opciones sincronizadas con el enum del backend */}
              <select className="nrm-select" value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option value="ABIERTA">Abierta</option>
                <option value="CERRADA">Cerrada</option>
                <option value="BLOQUEADA">Bloqueada</option>
              </select>
            </div>

            <div className="nrm-row">
              <div className="nrm-field">
                <label className="nrm-label">Registros <span className="nrm-opt">(opcional)</span></label>
                <input className="nrm-input" type="number" min="0" value={registros}
                  onChange={(e) => setRegistros(e.target.value)} placeholder="Ej: 12" />
              </div>
              <div className="nrm-field">
                <label className="nrm-label">Cumplimiento % <span className="nrm-opt">(opcional)</span></label>
                <input className="nrm-input" type="number" min="0" max="100" value={cumplimiento}
                  onChange={(e) => setCumplimiento(e.target.value)} placeholder="Ej: 85" />
              </div>
            </div>

            <div className="nrm-field">
              <label className="nrm-label">Observaciones <span className="nrm-opt">(opcional)</span></label>
              <textarea className="nrm-textarea" value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej: Semana en curso" rows={2} />
            </div>

            {error && <div className="nrm-error">{error}</div>}
          </div>

          <div className="nrm-footer">
            <button className="btn-modal-cancel" type="button" onClick={onClose}>Cancelar</button>
            <button className="btn-modal-submit" type="submit" disabled={saving}>
              {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear semana'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
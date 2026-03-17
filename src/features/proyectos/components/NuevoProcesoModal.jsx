import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function NuevoProcesoModal({
  isOpen,
  title = 'Nuevo Proceso',
  initialValues,
  onClose,
  onSubmit,
}) {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setCodigo(initialValues?.codigo ?? '');
    setNombre(initialValues?.nombre ?? '');
    setDescripcion(initialValues?.descripcion ?? '');
    const estadoValue = initialValues?.estado;
    setEstado(typeof estadoValue === 'boolean' ? estadoValue : true);
    setError(null);
    setSaving(false);
  }, [isOpen, initialValues]);

  if (!isOpen) return null;

  const isEdit = title.toLowerCase().includes('editar');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const payload = {
      codigo: String(codigo).trim(),
      nombre: String(nombre).trim(),
      descripcion: String(descripcion).trim(),
      estado: Boolean(estado),
    };

    if (!payload.codigo || !payload.nombre) {
      setError('Código y nombre son obligatorios');
      return;
    }

    try {
      setSaving(true);
      await onSubmit?.(payload);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'No se pudo guardar');
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* HEADER */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{title}</h3>
            <p className="modal-subtitle">Completa los datos del proceso</p>
          </div>
          <button className="modal-close-btn" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <form className="modal-body" onSubmit={handleSubmit}>
          <label className="field">
            <span>Código *</span>
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej: COSECHA"
              autoFocus
            />
          </label>

          <label className="field">
            <span>Nombre *</span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Cosecha"
            />
          </label>

          <label className="field">
            <span>Descripción</span>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción del proceso"
              rows="3"
              style={{
                padding: '12px 14px',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                color: '#111827',
                background: '#fff',
                outline: 'none',
                transition: 'border-color 0.2s',
                width: '100%',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </label>

          <label className="field">
            <span>Estado *</span>
            <select
              value={estado ? 'true' : 'false'}
              onChange={(e) => setEstado(e.target.value === 'true')}
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </label>

          {error && <div className="form-error">{error}</div>}

          {/* ACCIONES */}
          <div className="modal-actions">
            <button className="btn-modal-cancel" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn-modal-submit" type="submit" disabled={saving}>
              {saving ? 'Guardando…' : isEdit ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
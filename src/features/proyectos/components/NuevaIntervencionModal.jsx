import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function NuevaIntervencionModal({
  isOpen,
  title = 'Nueva Intervención',
  initialValues,
  onClose,
  onSubmit,
}) {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [procesos, setProcesos] = useState('');
  const [estado, setEstado] = useState(true);
  const [descripcion, setDescripcion] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setCodigo(initialValues?.codigo ?? '');
    setNombre(initialValues?.nombre ?? '');
    setProcesos(initialValues?.procesos ?? '');
    const estadoValue = initialValues?.estado;
    setEstado(typeof estadoValue === 'boolean' ? estadoValue : true);
    setDescripcion(initialValues?.descripcion ?? '');
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
      procesos: String(procesos).trim(),
      estado: Boolean(estado),
      descripcion: String(descripcion).trim(),
    };

    if (!payload.codigo || !payload.nombre || !payload.procesos) {
      setError('Código, nombre y procesos son obligatorios');
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
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* HEADER */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{title}</h3>
            <p className="modal-subtitle">Completa los datos de la intervención</p>
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
              placeholder="Ej: INT-001"
              autoFocus
            />
          </label>

          <label className="field">
            <span>Nombre *</span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Intervención Ejemplo"
            />
          </label>

          <label className="field">
            <span>Procesos *</span>
            <input
              value={procesos}
              onChange={(e) => setProcesos(e.target.value)}
              placeholder="Ej: Proceso 1, Proceso 2"
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

          <label className="field">
            <span>Descripción</span>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción opcional de la intervención"
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
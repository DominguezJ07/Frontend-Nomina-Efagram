import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function NuevaZonaModal({
  isOpen,
  title = 'Nueva Zona',
  initialValues,
  onClose,
  onSubmit,
}) {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [estado, setEstado] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setCodigo(initialValues?.codigo ?? '');
    setNombre(initialValues?.nombre ?? '');
    // El backend usa "activa" en lugar de "estado"
    const estadoValue = initialValues?.activa ?? initialValues?.estado;
    setEstado(
      typeof estadoValue === 'boolean' ? estadoValue : true
    );
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
      activa: Boolean(estado), // El backend usa "activa"
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
    <div className="modal-backdrop">
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
            <p className="modal-subtitle">Completa los datos de la zona territorial</p>
          </div>
          <button className="modal-close-btn" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <form className="modal-body" onSubmit={handleSubmit}>
          <label className="field">
            <span>Código</span>
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej: ZN-005"
              autoFocus
            />
          </label>

          <label className="field">
            <span>Nombre</span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Zona Norte"
            />
          </label>

          <label className="field">
            <span>Estado</span>
            <select
              value={estado ? 'true' : 'false'}
              onChange={(e) => setEstado(e.target.value === 'true')}
            >
              <option value="true">Activa</option>
              <option value="false">Inactiva</option>
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